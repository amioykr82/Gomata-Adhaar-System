import React, { useState, useRef } from 'react';
import { EnrollmentSummary } from './EnrollmentSummary';
import { Loader } from './Loader';
import { saveCow, saveAllCows, getAllCows, generateAadhaarId, getCowById, fileToBase64, getCurrentLocation, clearAllCows, sleep } from '../utils';
import { getBreedInfo, findMatchingCowId, getLocationName } from '../services/geminiService';
import type { CowData, ImageData } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { CowCard } from './CowCard';

interface DashboardProps {
    allCows: CowData[];
    refreshCowsList: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ allCows, refreshCowsList }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingText, setLoadingText] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [selectedCow, setSelectedCow] = useState<CowData | null>(null);
    const [skipDuplicateCheck, setSkipDuplicateCheck] = useState<boolean>(false);
    const bulkUploadInputRef = useRef<HTMLInputElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const enrollSingleCowFromBulk = async (images: File[], folderName: string, skipDupCheck: boolean): Promise<CowData> => {
        // Filter out non-image files (hidden files, .DS_Store, etc.)
        const validImages = images.filter(file => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            const hasValidType = validTypes.includes(file.type.toLowerCase());
            const notHidden = !file.name.startsWith('.');
            return hasValidType && notHidden && file.size > 0;
        });

        if (validImages.length === 0) {
            throw new Error(`No valid image files found in folder '${folderName}'. Only JPG, PNG, and WEBP are supported.`);
        }

        const firstImage = validImages[0];

        // Validate MIME type before processing
        if (!firstImage.type || firstImage.type === '') {
            throw new Error(`Invalid image file in folder '${folderName}': ${firstImage.name}. File type could not be determined.`);
        }

        const imageData: ImageData = {
            base64: await fileToBase64(firstImage),
            mimeType: firstImage.type,
        };

        // Only check for duplicates if not skipped
        if (!skipDupCheck) {
            const allCowsInDb = getAllCows();
            if (allCowsInDb.length > 0) {
                const matchedId = await findMatchingCowId(imageData, allCowsInDb, 0.95);
                if (matchedId) {
                    throw new Error(`Cow from folder '${folderName}' is a duplicate of already enrolled cow ${matchedId}.`);
                }
            }
        }

        const breedInfo = await getBreedInfo(imageData);
        if (breedInfo.error) {
            throw new Error(`Breed analysis failed for '${folderName}': ${breedInfo.error}`);
        }

        // Generate proper 12-digit Aadhaar ID
        const aadhaarId = generateAadhaarId();
        
        const newCow: CowData = {
            id: aadhaarId, // Proper 12-digit Aadhaar ID
            breedInfo,
            images: [imageData], // Store only 1 image to save space
            location: null,
            locationName: 'Bulk Upload',
            notes: `Source folder: ${folderName} | Valid images: ${validImages.length} | Used: ${firstImage.name}`,
            enrollmentDate: new Date().toISOString(),
        };

        return newCow;
    }

    const handleBulkUploadChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setError(null);
        setIsLoading(true);
        setLoadingText('Processing folders...');

        const filesByDir = Array.from(files).reduce((acc, file) => {
            const pathParts = (file as any).webkitRelativePath.split('/');
            if (pathParts.length > 1) {
                const dirName = pathParts[pathParts.length - 2];
                if (!acc[dirName]) {
                    acc[dirName] = [];
                }
                acc[dirName].push(file);
            }
            return acc;
        }, {} as Record<string, File[]>);

        const foldersToProcess = Object.keys(filesByDir);
        const totalCows = foldersToProcess.length;
        let enrolledCount = 0;
        let errorMessages: string[] = [];

        for (let i = 0; i < totalCows; i++) {
            const folderName = foldersToProcess[i];
            const cowFiles = filesByDir[folderName];
            setLoadingText(`Enrolling cow ${i + 1}/${totalCows} (from folder ${folderName})...`);
            try {
                const newCow = await enrollSingleCowFromBulk(cowFiles, folderName, skipDuplicateCheck);
                saveCow(newCow);
                enrolledCount++;
                console.log(`✅ Successfully enrolled folder "${folderName}" → Aadhaar ID: ${newCow.id}`);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred.';
                console.error(`❌ Failed to enroll folder "${folderName}":`, message);
                errorMessages.push(`Folder "${folderName}": ${message}`);
            }
            // Avoid hitting API rate limits
            if (i < totalCows - 1) {
                setLoadingText(`Pausing to respect API limits... (Processed ${i + 1}/${totalCows})`);
                await sleep(5000); // 5 second delay
            }
        }

        setLoadingText(`Bulk enrollment complete. Successfully enrolled ${enrolledCount} of ${totalCows} cows.`);
        if (errorMessages.length > 0) {
            const failedCount = totalCows - enrolledCount;
            setError(`Enrolled ${enrolledCount} cows successfully. ${failedCount} folders had issues:\n\n${errorMessages.slice(0, 10).join('\n\n')}${errorMessages.length > 10 ? `\n\n...and ${errorMessages.length - 10} more errors` : ''}`);
        }
        setIsLoading(false);
        refreshCowsList();
    };

    const handleExportClick = () => {
        const data = JSON.stringify(getAllCows(), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cows.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!window.confirm("This will overwrite your current database. Are you sure you want to continue?")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("Invalid file content");
                const importedCows: CowData[] = JSON.parse(text);

                if (!Array.isArray(importedCows) || (importedCows.length > 0 && !importedCows[0].id)) {
                    throw new Error("Invalid JSON format for cow database.");
                }

                saveAllCows(importedCows);
                refreshCowsList();
                alert(`Successfully imported ${importedCows.length} cows into the database.`);

            } catch (err) {
                const message = err instanceof Error ? err.message : 'An unknown error occurred.';
                setError(`Import failed: ${message}`);
            }
        };
        reader.onerror = () => {
            setError('Failed to read the selected file.');
        };
        reader.readAsText(file);
    }

    const handleClearDatabase = () => {
        if (window.confirm("Are you sure you want to delete all enrolled cow data? This action is irreversible.")) {
            clearAllCows();
            refreshCowsList();
            setSelectedCow(null);
            alert("Database has been cleared successfully.");
        }
    }

    if (selectedCow) {
        return (
            <div className="animate-fade-in space-y-4">
                <button
                    onClick={() => setSelectedCow(null)}
                    className="flex items-center space-x-2 text-green-700 hover:text-green-900 font-semibold transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Back to Summary</span>
                </button>
                <CowCard cow={selectedCow} title="Enrolled Cow Details" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="border-l-4 border-orange-600 pl-4 py-2">
                <h2 className="text-2xl font-bold text-gray-800">Database Management</h2>
                <p className="text-gray-600 mt-1">Manage cattle records, bulk operations, and data export/import</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700 font-semibold">Total Enrolled</p>
                    <p className="text-3xl font-bold text-green-800 mt-1">{allCows.length}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700 font-semibold">Database Status</p>
                    <p className="text-lg font-bold text-blue-800 mt-1">{allCows.length > 0 ? 'Active' : 'Empty'}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-700 font-semibold">System Status</p>
                    <p className="text-lg font-bold text-orange-800 mt-1">Operational</p>
                </div>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                    Data Export & Import
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button onClick={handleExportClick} disabled={allCows.length === 0} className="bg-white border-2 border-blue-600 text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Export Dataset
                    </button>
                    <button onClick={() => importInputRef.current?.click()} className="bg-white border-2 border-purple-600 text-purple-600 font-semibold py-3 px-4 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Import Dataset
                    </button>
                    <input type="file" ref={importInputRef} onChange={handleImportChange} className="hidden" accept="application/json" />
                </div>
            </div>

            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                    Bulk Enrollment
                </h3>
                <p className="text-sm text-gray-600">Upload multiple cattle records at once by selecting a folder containing subfolders (one per cattle)</p>

                <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <input
                        type="checkbox"
                        id="skipDuplicateCheck"
                        checked={skipDuplicateCheck}
                        onChange={(e) => setSkipDuplicateCheck(e.target.checked)}
                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="skipDuplicateCheck" className="text-sm text-gray-800 cursor-pointer">
                        <strong>Skip duplicate detection</strong> (recommended for initial enrollment)
                    </label>
                </div>

                <button
                    onClick={() => bulkUploadInputRef.current?.click()}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 px-6 rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md flex items-center justify-center space-x-2"
                >
                    <UploadIcon className="w-6 h-6" />
                    <span>{isLoading ? 'Processing Enrollment...' : 'Select Folder for Bulk Upload'}</span>
                </button>
                <input
                    type="file"
                    ref={bulkUploadInputRef}
                    onChange={handleBulkUploadChange}
                    className="hidden"
                    // @ts-ignore
                    webkitdirectory="true"
                    directory="true"
                />
            </div>
            <div className="mt-6 min-h-[100px] flex items-center justify-center">
                {isLoading && <Loader text={loadingText} />}
                {error && <div className="w-full text-center text-red-600 font-semibold p-4 bg-red-50 rounded-lg whitespace-pre-wrap"><p>Error: {error}</p></div>}
            </div>

            <div className="bg-red-50 rounded-lg border-2 border-red-300 p-6 space-y-3">
                <h3 className="text-lg font-bold text-red-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Database Reset
                </h3>
                <p className="text-sm text-red-700">Permanently delete all cattle records from local storage. This action cannot be undone.</p>
                <button
                    onClick={handleClearDatabase}
                    disabled={allCows.length === 0}
                    className="bg-red-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                >
                    Clear All Records
                </button>
            </div>

            <EnrollmentSummary cows={allCows} onCowSelect={setSelectedCow} />
        </div>
    );
};
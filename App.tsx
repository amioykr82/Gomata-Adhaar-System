import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CowIcon } from './components/icons/CowIcon';
import { UserPlusIcon } from './components/icons/UserPlusIcon';
import { FingerprintIcon } from './components/icons/FingerprintIcon';
import { UploadIcon } from './components/icons/UploadIcon';
import { DashboardIcon } from './components/icons/DashboardIcon';
import { MultiImageUploader } from './components/MultiImageUploader';
import { Loader } from './components/Loader';
import { CowCard } from './components/CowCard';
import { Dashboard } from './components/Dashboard';
import { getBreedInfo, findMatchingCowId, getLocationName } from './services/geminiService';
import { saveCow, getAllCows, getCowById, generateAadhaarId } from './utils';
import { fileToBase64, getCurrentLocation } from './utils';
import type { CowData, ImageData } from './types';

type ActiveTab = 'enroll' | 'auth' | 'dashboard';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('enroll');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [allCowsList, setAllCowsList] = useState<CowData[]>([]);

  // Enroll state
  const [enrollImages, setEnrollImages] = useState<File[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [enrolledCow, setEnrolledCow] = useState<CowData | null>(null);

  // Auth state
  const [authImage, setAuthImage] = useState<File | null>(null);
  const [authImageUrl, setAuthImageUrl] = useState<string | null>(null);
  const [matchedCow, setMatchedCow] = useState<CowData | null>(null);
  const authFileInputRef = useRef<HTMLInputElement>(null);

  const refreshCowsList = useCallback(() => {
    setAllCowsList(getAllCows());
  }, []);

  useEffect(() => {
    // Initialize database from dataset file on first load
    const initDB = async () => {
      const { initializeDatabase } = await import('./utils');
      await initializeDatabase();
      refreshCowsList();
    };
    initDB();
  }, [refreshCowsList]);


  const resetState = (tab: ActiveTab) => {
    setIsLoading(false);
    setError(null);
    setLoadingText('');
    if (tab === 'enroll') {
        setEnrollImages([]);
        setNotes('');
        setEnrolledCow(null);
    } else if (tab === 'auth') {
        setAuthImage(null);
        setAuthImageUrl(null);
        setMatchedCow(null);
        if (authFileInputRef.current) authFileInputRef.current.value = "";
    }
  };
  
  const handleTabChange = (tab: ActiveTab) => {
      setActiveTab(tab);
      resetState(activeTab);
  };
  
  // --- ENROLLMENT LOGIC ---
  const handleEnroll = useCallback(async () => {
    if (enrollImages.length === 0) {
      setError("Please upload at least one image to enroll a cow.");
      return;
    }
    resetState('enroll');
    setIsLoading(true);

    try {
      setLoadingText("Preparing image for analysis...");
      const imageDatas: ImageData[] = await Promise.all(
        enrollImages.map(async (file) => ({
          base64: await fileToBase64(file),
          mimeType: file.type,
        }))
      );
      
      // --- Deduplication Check ---
      setLoadingText("Checking for duplicates...");
      const allCows = getAllCows();
      if (allCows.length > 0) {
        const matchedId = await findMatchingCowId(imageDatas[0], allCows);
        if (matchedId) {
            const existingCow = getCowById(matchedId);
            if (existingCow) {
                setEnrolledCow(existingCow);
                throw new Error(`This cow appears to be already enrolled. See details below.`);
            }
        }
      }

      setLoadingText("Getting location...");
      const location = await getCurrentLocation();
      let locationName: string | undefined = undefined;

      if (location) {
        setLoadingText("Identifying location name...");
        const name = await getLocationName(location);
        if(name) {
          locationName = name;
        }
      }

      setLoadingText("Analyzing cow breed...");
      const breedInfo = await getBreedInfo(imageDatas[0]);
      if (breedInfo.error) {
        throw new Error(breedInfo.error);
      }

      setLoadingText("Generating Aadhaar ID...");
      const newCow: CowData = {
        id: generateAadhaarId(),
        breedInfo,
        images: imageDatas,
        location,
        locationName,
        notes,
        enrollmentDate: new Date().toISOString(),
      };

      setLoadingText("Saving to database...");
      saveCow(newCow);
      setEnrolledCow(newCow);
      refreshCowsList();

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during enrollment.");
    } finally {
      setIsLoading(false);
      setLoadingText('');
    }
  }, [enrollImages, notes, refreshCowsList]);


  // --- AUTHENTICATION LOGIC ---
  const handleAuthFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    resetState('auth');
    if (file) {
      setAuthImage(file);
      setAuthImageUrl(URL.createObjectURL(file));
    }
  };
  
  const handleAuthenticate = useCallback(async () => {
    if (!authImage) {
        setError("Please upload an image to authenticate.");
        return;
    }
    resetState('auth');
    setIsLoading(true);

    try {
        setLoadingText("Reading database...");
        const allCows = getAllCows();
        if(allCows.length === 0) {
            throw new Error("No cows enrolled yet. Please enroll a cow first in the Enrollment tab.");
        }
        
        setLoadingText("Preparing image for analysis...");
        const authImageData: ImageData = {
            base64: await fileToBase64(authImage),
            mimeType: authImage.type
        };

        setLoadingText("Comparing with enrolled cows...");
        const matchedId = await findMatchingCowId(authImageData, allCows);

        if (matchedId) {
            setLoadingText("Match found! Fetching details...");
            const cowData = getCowById(matchedId);
            if (cowData) {
                setMatchedCow(cowData);
            } else {
                 throw new Error(`Match found for ID ${matchedId}, but cow data could not be retrieved.`);
            }
        } else {
            setError("No matching cow found in the database.");
        }

    } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred during authentication.");
    } finally {
        setIsLoading(false);
        setLoadingText('');
    }

  }, [authImage]);
  
  const TabButton: React.FC<{tab: ActiveTab, label: string, icon: React.ReactNode}> = ({ tab, label, icon}) => (
     <button
        onClick={() => handleTabChange(tab)}
        className={`flex-1 flex items-center justify-center space-x-2 p-3 font-semibold transition-all duration-200 ${
          activeTab === tab
            ? 'bg-white text-green-700 border-b-3 border-green-600 shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
        }`}
      >
        {icon}
        <span className="text-sm md:text-base">{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 font-sans">
      <div className="container mx-auto max-w-6xl p-4">
        {/* Professional Government-Style Header */}
        <header className="bg-white shadow-md rounded-lg mb-6 border-t-4 border-orange-500">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-orange-500 to-green-600 p-3 rounded-full">
                  <CowIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Gomata Aadhaar</h1>
                  <p className="text-sm text-gray-600 mt-1">National Cattle Identification System</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <div className="text-right">
                  <p className="font-semibold">Total Enrolled</p>
                  <p className="text-2xl font-bold text-green-600">{allCowsList.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex border-t border-gray-200 bg-gray-50">
            <TabButton tab="enroll" label="Enrollment" icon={<UserPlusIcon className="w-5 h-5"/>} />
            <TabButton tab="auth" label="Authentication" icon={<FingerprintIcon className="w-5 h-5"/>} />
            <TabButton tab="dashboard" label="Management" icon={<DashboardIcon className="w-5 h-5"/>} />
          </nav>
        </header>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">

            <main className="p-6 md:p-10">
              {activeTab === 'enroll' && (
                <div className="space-y-6">
                  <div className="border-l-4 border-green-600 pl-4 py-2">
                    <h2 className="text-2xl font-bold text-gray-800">New Cattle Enrollment</h2>
                    <p className="text-gray-600 mt-1">Upload cattle images to generate a unique 12-digit Aadhaar ID</p>
                  </div>
                  <MultiImageUploader onImagesChange={setEnrollImages} />
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea 
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., vaccination history, owner details..."
                    />
                  </div>
                  <button
                    onClick={handleEnroll}
                    disabled={enrollImages.length === 0 || isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 px-6 rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md flex items-center justify-center text-lg"
                    >
                    {isLoading ? 'Processing Enrollment...' : 'Generate Aadhaar ID'}
                  </button>
                  <div className="mt-6 min-h-[100px] flex items-center justify-center">
                    {isLoading && <Loader text={loadingText} />}
                    {error && <div className="text-center text-red-600 font-semibold p-4 bg-red-50 rounded-lg"><p>Error: {error}</p></div>}
                    {enrolledCow && <CowCard cow={enrolledCow} title={error ? "Duplicate Found" : "Enrollment Successful!"} />}
                  </div>
                </div>
              )}

              {activeTab === 'auth' && (
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-600 pl-4 py-2">
                    <h2 className="text-2xl font-bold text-gray-800">Cattle Authentication</h2>
                    <p className="text-gray-600 mt-1">Verify cattle identity using biometric image matching</p>
                  </div>
                  
                  <div
                    className="relative w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all duration-300 overflow-hidden group"
                    onClick={() => authFileInputRef.current?.click()}
                  >
                    <input
                        type="file"
                        ref={authFileInputRef}
                        onChange={handleAuthFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                    />
                    {authImageUrl ? (
                        <>
                        <img src={authImageUrl} alt="Uploaded Cow" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all duration-300">
                            <span className="text-white text-lg font-bold opacity-0 group-hover:opacity-100">Change Image</span>
                        </div>
                        </>
                    ) : (
                        <div className="text-center p-4">
                        <UploadIcon className="w-16 h-16 mx-auto mb-2 text-gray-400 group-hover:text-green-500 transition-colors" />
                        <p className="font-semibold">Click to upload an image of a cow</p>
                        <p className="text-sm">PNG, JPG, or WEBP</p>
                        </div>
                    )}
                  </div>
                  <button
                    onClick={handleAuthenticate}
                    disabled={!authImage || isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md flex items-center justify-center text-lg"
                  >
                    {isLoading ? 'Verifying Identity...' : 'Verify Cattle Identity'}
                  </button>
                   <div className="mt-6 min-h-[100px] flex items-center justify-center">
                    {isLoading && <Loader text={loadingText} />}
                    {error && <div className="text-center text-red-600 font-semibold p-4 bg-red-50 rounded-lg"><p>{error}</p></div>}
                    {matchedCow && <CowCard cow={matchedCow} title="Authentication Match Found" />}
                  </div>
                </div>
              )}
              {activeTab === 'dashboard' && (
                <Dashboard allCows={allCowsList} refreshCowsList={refreshCowsList} />
              )}
            </main>
        </div>
        
        <footer className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Gomata Aadhaar System</span> • National Cattle Identification Platform
            </p>
            <p className="text-xs text-gray-500 mt-1">Powered by AI-based Biometric Recognition Technology</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
import React from 'react';
import type { CowData } from '../types';
import { CowIcon } from './icons/CowIcon';

interface CowCardProps {
  cow: CowData;
  title: string;
}

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 border-b border-gray-100 last:border-0">
    <dt className="text-sm font-semibold text-gray-600">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value}</dd>
  </div>
);

export const CowCard: React.FC<CowCardProps> = ({ cow, title }) => {
  const confidencePercentage = cow.breedInfo.confidence ? Math.round(cow.breedInfo.confidence * 100) : 0;
  
  const getConfidenceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatAadhaarId = (id: string): string => {
    if (!id || id.length !== 12) return id;
    return `${id.slice(0, 4)} ${id.slice(4, 8)} ${id.slice(8, 12)}`;
  };

  const primaryImageUrl = `data:${cow.images[0].mimeType};base64,${cow.images[0].base64}`;

  return (
    <div className="w-full bg-white shadow-xl rounded-lg overflow-hidden animate-fade-in border-2 border-green-200">
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-5">
            <h3 className="text-xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {title}
            </h3>
        </div>
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <img src={primaryImageUrl} alt="Enrolled Cow" className="w-full h-auto object-cover rounded-lg shadow-md" />
                </div>
                <div className="md:col-span-2">
                    <dl className="bg-gray-50 rounded-lg p-4">
                        <InfoRow label="Aadhaar ID" value={<span className="font-mono bg-green-100 text-green-800 px-3 py-1 rounded font-bold text-base">{formatAadhaarId(cow.id)}</span>} />
                        <InfoRow label="Breed" value={<span className="font-bold text-lg text-gray-800">{cow.breedInfo.breed}</span>} />
                        {cow.breedInfo.confidence && (
                             <InfoRow label="Confidence" value={<span className={`font-semibold ${getConfidenceColor(confidencePercentage)}`}>{confidencePercentage}%</span>} />
                        )}
                        <InfoRow label="Description" value={cow.breedInfo.description} />
                        <InfoRow label="Enrollment Date" value={new Date(cow.enrollmentDate).toLocaleString()} />
                        <InfoRow label="Location" value={cow.locationName || (cow.location ? `${cow.location.latitude.toFixed(4)}, ${cow.location.longitude.toFixed(4)}` : 'Not available')} />
                        <InfoRow label="Notes" value={cow.notes || 'N/A'} />
                    </dl>
                </div>
            </div>
            {cow.images.length > 1 && (
                <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-600 mb-2">Enrolled Images</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {cow.images.map((image, index) => (
                             <img key={index} src={`data:${image.mimeType};base64,${image.base64}`} alt={`Cow image ${index+1}`} className="w-full h-auto object-cover rounded shadow"/>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
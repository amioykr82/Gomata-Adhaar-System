import React from 'react';
import type { CowData } from '../types';

interface EnrollmentSummaryProps {
  cows: CowData[];
  onCowSelect: (cow: CowData) => void;
}

const formatAadhaarId = (id: string): string => {
  if (!id || id.length !== 12) return id;
  return `${id.slice(0, 4)} ${id.slice(4, 8)} ${id.slice(8, 12)}`;
};

export const EnrollmentSummary: React.FC<EnrollmentSummaryProps> = ({ cows, onCowSelect }) => {
  if (cows.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700">No Cows Enrolled</h3>
        <p className="text-gray-500 mt-1">Enroll a cow or import a database to see a summary here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
       <div className="flex items-center justify-between border-b-2 border-gray-200 pb-3">
         <h3 className="text-xl font-bold text-gray-800">Enrolled Cattle Records</h3>
         <span className="bg-green-600 text-white px-4 py-1 rounded-full font-bold">{cows.length}</span>
       </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cows.map((cow) => (
          <button
            key={cow.id}
            onClick={() => onCowSelect(cow)}
            className="w-full bg-white p-4 rounded-lg shadow-md border-2 border-gray-200 hover:border-green-500 flex items-start space-x-4 transition-all hover:shadow-lg text-left"
          >
             <img 
                src={`data:${cow.images[0].mimeType};base64,${cow.images[0].base64}`} 
                alt={`Cow ${cow.id}`} 
                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 flex-shrink-0"
              />
              <div className="flex-grow">
                <p className="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-semibold inline-block mb-2">{formatAadhaarId(cow.id)}</p>
                <p className="font-bold text-gray-800">{cow.breedInfo.breed || 'Unknown Breed'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Date(cow.enrollmentDate).toLocaleDateString()}
                </p>
              </div>
          </button>
        ))}
       </div>
    </div>
  );
};

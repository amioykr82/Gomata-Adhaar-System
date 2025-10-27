
import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface MultiImageUploaderProps {
  onImagesChange: (files: File[]) => void;
  maxFiles?: number;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ onImagesChange, maxFiles = 6 }) => {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.slice(0, maxFiles);
    onImagesChange(newFiles);

    // Fix: Explicitly type 'file' as 'File' to help TypeScript's type inference.
    const newPreviews = newFiles.map((file: File) => URL.createObjectURL(file));
    // Clean up old object URLs to prevent memory leaks
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews(newPreviews);
  }, [onImagesChange, maxFiles, imagePreviews]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImagePreviews([]);
      onImagesChange([]);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  return (
    <div className="w-full">
        <div
            className="relative w-full p-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all duration-300 group"
            onClick={handleClick}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                multiple
            />
             <div className="text-center p-4">
                <UploadIcon className="w-12 h-12 mx-auto mb-2 text-gray-400 group-hover:text-green-500 transition-colors" />
                <p className="font-semibold">Click to upload head images</p>
                <p className="text-sm">Up to {maxFiles} files (PNG, JPG, WEBP)</p>
             </div>
        </div>

        {imagePreviews.length > 0 && (
            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700">Selected Images ({imagePreviews.length}/{maxFiles})</h4>
                    <button onClick={handleClear} className="text-sm text-red-600 hover:underline">Clear all</button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 p-2 bg-gray-100 rounded-lg">
                    {imagePreviews.map((src, index) => (
                        <div key={index} className="relative aspect-square">
                            <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-md shadow" />
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

import type { CowData, GeolocationPosition } from './types';

// --- DB Functions ---
const DB_KEY = 'gomataAadhaarDb';
const DATASET_LOADED_KEY = 'datasetLoaded';

export const getAllCows = (): CowData[] => {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to retrieve cows from localStorage", error);
    return [];
  }
};

export const loadDatasetFromFile = async (): Promise<CowData[]> => {
  try {
    const response = await fetch('/dataset/cows-dataset.json');
    if (!response.ok) {
      // File not found or not accessible - this is normal for fresh installations
      return [];
    }
    
    const text = await response.text();
    
    // Check if response is actually JSON (not HTML)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      // Got HTML instead of JSON - file doesn't exist or wrong path
      return [];
    }
    
    // Try to parse as JSON
    const dataset: CowData[] = JSON.parse(text);
    return Array.isArray(dataset) && dataset.length > 0 ? dataset : [];
  } catch (error) {
    // Silent fail - dataset file is optional
    return [];
  }
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    // Check if we've already loaded the dataset
    const datasetLoaded = localStorage.getItem(DATASET_LOADED_KEY);
    const existingCows = getAllCows();
    
    // Only load from file if localStorage is empty and we haven't loaded before
    if (existingCows.length === 0 && !datasetLoaded) {
      const dataset = await loadDatasetFromFile();
      if (dataset.length > 0) {
        saveAllCows(dataset);
        localStorage.setItem(DATASET_LOADED_KEY, 'true');
        console.log(`✅ Loaded ${dataset.length} cattle records from dataset file`);
      } else {
        // Mark as loaded even if empty to prevent repeated attempts
        localStorage.setItem(DATASET_LOADED_KEY, 'true');
      }
    }
  } catch (error) {
    // Silent fail - dataset loading is optional
    localStorage.setItem(DATASET_LOADED_KEY, 'true');
  }
};

export const saveCow = (cowData: CowData): void => {
  try {
    const cows = getAllCows();
    // Avoid duplicates
    if (!cows.some(c => c.id === cowData.id)) {
        cows.push(cowData);
        localStorage.setItem(DB_KEY, JSON.stringify(cows));
    }
  } catch (error) {
    console.error("Failed to save cow to localStorage", error);
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new Error(`Storage quota exceeded. ${cows.length} cows enrolled so far. Please export the dataset now and clear the database before continuing.`);
    }
    throw error;
  }
};

export const saveAllCows = (cows: CowData[]): void => {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(cows));
    } catch (error) {
        console.error("Failed to save all cows to localStorage", error);
    }
}

export const getCowById = (id: string): CowData | undefined => {
    const cows = getAllCows();
    return cows.find(cow => cow.id === id);
};

export const clearAllCows = (): void => {
    try {
        localStorage.removeItem(DB_KEY);
    } catch (error) {
        console.error("Failed to clear localStorage", error);
    }
}

export const generateAadhaarId = (): string => {
  // Generate 12-digit Aadhaar ID (format: XXXX XXXX XXXX)
  // Ensure first digit is not 0 or 1 (as per Aadhaar standards)
  let id = '';
  
  // First digit: 2-9 (Aadhaar numbers don't start with 0 or 1)
  id += Math.floor(Math.random() * 8) + 2;
  
  // Remaining 11 digits: 0-9
  for (let i = 1; i < 12; i++) {
    id += Math.floor(Math.random() * 10);
  }
  
  return id;
};

export const formatAadhaarId = (id: string): string => {
  // Format as XXXX XXXX XXXX for display
  if (id.length !== 12) return id;
  return `${id.slice(0, 4)} ${id.slice(4, 8)} ${id.slice(8, 12)}`;
};


// --- Image Functions ---
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};


// --- Geolocation Functions ---
export const getCurrentLocation = (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn("Geolocation is not supported by this browser.");
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }),
            (error) => {
                console.error("Error getting location:", error);
                resolve(null); // Resolve with null on error
            }
        );
    });
};

// --- Utility Functions ---
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
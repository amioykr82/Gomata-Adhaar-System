export interface GeolocationPosition {
  latitude: number;
  longitude: number;
}

export interface CowBreedInfo {
  breed?: string;
  description?: string;
  confidence?: number;
  error?: string;
}

export interface ImageData {
  base64: string;
  mimeType: string;
}

export interface CowData {
  id: string; // UUID
  breedInfo: CowBreedInfo;
  images: ImageData[];
  location: GeolocationPosition | null;
  locationName?: string;
  notes: string;
  enrollmentDate: string;
}
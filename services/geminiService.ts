import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { CowBreedInfo, ImageData, CowData, GeolocationPosition } from '../types';
import { sleep } from '../utils';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = 'gemini-2.5-flash';

// --- Retry Logic for API Calls ---
const MAX_RETRIES = 4;
const INITIAL_BACKOFF_MS = 5000; // Start with 5 seconds

async function callGeminiWithRetry<T>(apiCall: () => Promise<T>): Promise<T> {
  let lastError: any = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      const errorMessage = (error instanceof Error) ? error.message : String(error);
      
      // Check if it's a rate limit error
      if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        if (attempt < MAX_RETRIES - 1) {
          const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
          console.warn(`Rate limit hit. Retrying in ${delay / 1000} seconds... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
          await sleep(delay);
        }
      } else {
        // Not a rate limit error, fail immediately
        throw error;
      }
    }
  }
  // If all retries fail, throw the last error
  console.error("All retries failed for Gemini API call after hitting rate limits.");
  throw lastError;
}


const breedInfoSchema = {
  type: Type.OBJECT,
  properties: {
    breed: {
      type: Type.STRING,
      description: "The identified breed of the cow. e.g., 'Holstein Friesian'. If no cow is detected, this should be 'Unknown'."
    },
    description: {
      type: Type.STRING,
      description: "A brief, interesting one-paragraph description of the breed's characteristics and origin."
    },
    confidence: {
      type: Type.NUMBER,
      description: "A confidence score from 0.0 to 1.0 on the breed identification."
    },
    error: {
        type: Type.STRING,
        description: "An error message if a cow is not clearly detected in the image. e.g., 'No cow was detected in the provided image.'"
    },
  },
  required: ['breed', 'description', 'confidence']
};

export const getBreedInfo = async (imageData: ImageData): Promise<CowBreedInfo> => {
  try {
    const apiCall = () => {
        const prompt = "Analyze the image of this cow. Identify its breed, provide a brief description, and a confidence score. If the image does not clearly show a cow, please indicate that in the error field and set breed to 'Unknown'.";
        
        const imagePart = {
          inlineData: {
            data: imageData.base64,
            mimeType: imageData.mimeType,
          },
        };

        return ai.models.generateContent({
          model,
          contents: { parts: [ {text: prompt}, imagePart ] },
          config: {
              responseMimeType: "application/json",
              responseSchema: breedInfoSchema,
          }
        });
    }
    
    // FIX: Explicitly provide the generic type to callGeminiWithRetry to ensure correct type inference for the response.
    const response = await callGeminiWithRetry<GenerateContentResponse>(apiCall);

    const jsonString = response.text.trim();
    const result: CowBreedInfo = JSON.parse(jsonString);

    if (result.error || result.breed === 'Unknown') {
        return { error: result.error || "Could not determine the breed. The image may not contain a cow." };
    }
    
    return result;

  } catch (error) {
    console.error("Error calling Gemini API for breed info:", error);
    if (error instanceof Error) {
        return { error: `API Error: ${error.message}` };
    }
    return { error: "An unexpected error occurred during breed recognition." };
  }
};

const matchSchema = {
    type: Type.OBJECT,
    properties: {
        isMatch: {
            type: Type.BOOLEAN,
            description: "Whether the cow in the primary image is a confident match to one of the reference cows. Only return true if you are HIGHLY CONFIDENT (95%+) that it's the exact same individual animal."
        },
        matchedId: {
            type: Type.STRING,
            description: "The ID of the matching reference cow. This should be null if isMatch is false."
        },
        confidence: {
            type: Type.NUMBER,
            description: "A confidence score from 0.0 to 1.0 indicating how certain you are about the match."
        },
        reason: {
            type: Type.STRING,
            description: "A brief explanation for the match or no-match decision."
        }
    },
    required: ['isMatch', 'matchedId', 'confidence', 'reason']
};

export const findMatchingCowId = async (authImage: ImageData, enrolledCows: CowData[], confidenceThreshold: number = 0.95): Promise<string | null> => {
    if (enrolledCows.length === 0) return null;
    
    try {
        const apiCall = () => {
            const prompt = `You are a cow identification expert. Your task is to determine if the cow in the 'Primary Image' is the EXACT SAME INDIVIDUAL ANIMAL as any of the cows in the 'Reference Images'. 

IMPORTANT GUIDELINES:
- Only return isMatch=true if you are HIGHLY CONFIDENT (95%+ certainty) that it's the exact same individual cow
- Different cows of the same breed should NOT match
- Look for UNIQUE identifying features: specific spot patterns, facial markings, ear shapes, horn patterns
- If you have ANY doubt, return isMatch=false
- Similar-looking cows are NOT matches unless they have identical unique features

Each reference cow has a unique ID. Respond with a JSON object indicating if there is a definitive match.`;

            const parts: any[] = [
                { text: prompt },
                { text: "Primary Image:" },
                { inlineData: { data: authImage.base64, mimeType: authImage.mimeType }},
                { text: "Reference Images:" }
            ];

            enrolledCows.forEach(cow => {
                parts.push({ text: `Cow ID: ${cow.id}`});
                // Use the first enrolled image as the reference
                parts.push({ inlineData: { data: cow.images[0].base64, mimeType: cow.images[0].mimeType }});
            });

            return ai.models.generateContent({
                model,
                contents: { parts: parts },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: matchSchema,
                }
            });
        };
        
        // FIX: Explicitly provide the generic type to callGeminiWithRetry to ensure correct type inference for the response.
        const response = await callGeminiWithRetry<GenerateContentResponse>(apiCall);

        const jsonString = response.text.trim();
        const result: { isMatch: boolean; matchedId: string | null; confidence: number; reason: string } = JSON.parse(jsonString);

        console.log(`Match result: isMatch=${result.isMatch}, confidence=${result.confidence}, reason=${result.reason}`);

        // Only return a match if both isMatch is true AND confidence meets threshold
        if (result.isMatch && result.confidence >= confidenceThreshold) {
            return result.matchedId;
        }
        
        return null;

    } catch (error) {
        console.error("Error calling Gemini API for matching:", error);
        return null;
    }
}

export const getLocationName = async (location: GeolocationPosition): Promise<string | null> => {
  try {
    const apiCall = () => {
        const prompt = `Based on the following coordinates, provide a concise location name (e.g., "City, State, Country" or "Neighborhood, City"). Do not add any introductory text. Just provide the location name. Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
        
        return ai.models.generateContent({
          model,
          contents: prompt,
        });
    };
    
    // FIX: Explicitly provide the generic type to callGeminiWithRetry to ensure correct type inference for the response.
    const response = await callGeminiWithRetry<GenerateContentResponse>(apiCall);

    const locationName = response.text.trim();
    
    if (locationName && locationName.length > 3 && locationName.length < 150) {
        return locationName;
    }
    console.warn("Received invalid location name from API:", locationName);
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`; // Fallback

  } catch (error) {
    console.error("Error calling Gemini API for location name:", error);
    return null;
  }
};
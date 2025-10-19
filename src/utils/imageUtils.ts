import { STORAGE_DOMAIN } from '../config/apiConfig';

/**
 * Constructs a complete URL for a profile picture or other storage file
 * @param filePath - The relative path from storage (e.g., "profile_picture/ktjd7tYT6PUe10OEUamNXuWlGlJD8nqSwHMLv5nN.svg")
 * @returns Complete URL or null if no filePath provided
 */
export const getStorageUrl = (filePath: string | null | undefined): string | null => {
  if (!filePath) return null;
  
  // If the filePath already contains the full domain, return as is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // Construct the complete URL
  return `${STORAGE_DOMAIN}/${filePath}`;
};

/**
 * Gets profile picture URL with fallback
 * @param profilePicture - The profile picture path from API
 * @param fallbackImage - Fallback image path (e.g., from constants/images)
 * @returns Complete URL or fallback image
 */
export const getProfilePictureUrl = (profilePicture: string | null | undefined, fallbackImage: string): string => {
  const storageUrl = getStorageUrl(profilePicture);
  return storageUrl || fallbackImage;
};

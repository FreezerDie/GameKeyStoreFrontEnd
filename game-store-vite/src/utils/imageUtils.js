// Utility functions for handling image URLs

const IMAGE_BASE_URL = 'https://s3.tebi.io/game-key-store';

/**
 * Get full image URL for a category
 * @param {string} filename - Just the filename (e.g., 'action-games.jpg')
 * @returns {string} Full URL
 */
export const getCategoryImageUrl = (filename) => {
  if (!filename) return '';
  return `${IMAGE_BASE_URL}/categories/${filename}`;
};

/**
 * Get full image URL for a game
 * @param {string} filename - Just the filename (e.g., 'call-of-duty.jpg')
 * @returns {string} Full URL
 */
export const getGameImageUrl = (filename) => {
  if (!filename) return '';
  return `${IMAGE_BASE_URL}/games/${filename}`;
};

/**
 * Extract filename from full URL (for editing purposes)
 * @param {string} url - Full URL
 * @returns {string} Just the filename
 */
export const extractFilename = (url) => {
  if (!url) return '';
  return url.split('/').pop();
};

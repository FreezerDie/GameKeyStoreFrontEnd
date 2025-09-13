// API utility functions for handling HTTP requests with authentication

import { getAuthCookies, clearAuthCookies, setAuthCookies } from './cookieUtils';

// Base API configuration
const API_BASE_URL = '/api';

/**
 * Create headers for API requests
 * @param {object} additionalHeaders - Additional headers to include
 * @returns {object} Headers object
 */
const createHeaders = (additionalHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
  
  // Add Authorization header if token exists
  const authData = getAuthCookies();
  if (authData && authData.token) {
    headers.Authorization = `Bearer ${authData.token}`;
  }
  
  return headers;
};

/**
 * Handle API response and check for authentication errors
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>} Parsed response data
 */
const handleResponse = async (response) => {
  // If unauthorized, clear auth cookies
  if (response.status === 401) {
    clearAuthCookies();
    // Optionally redirect to login page
    window.location.href = '/login';
    throw new Error('Authentication failed. Please log in again.');
  }
  
  // If response is not ok, throw error
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint (relative to base URL)
 * @param {object} options - Fetch options
 * @returns {Promise<any>} API response data
 */
const apiRequest = async (endpoint, options = {}) => {
  // Ensure proper URL construction with forward slash
  const url = `${API_BASE_URL}/${endpoint}`;
  const headers = createHeaders(options.headers);
  
  const config = {
    ...options,
    headers
  };
  
  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

/**
 * GET request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Additional fetch options
 * @returns {Promise<any>} API response data
 */
export const apiGet = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    method: 'GET',
    ...options
  });
};

/**
 * POST request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @param {object} options - Additional fetch options
 * @returns {Promise<any>} API response data
 */
export const apiPost = (endpoint, data = {}, options = {}) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options
  });
};

/**
 * PUT request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @param {object} options - Additional fetch options
 * @returns {Promise<any>} API response data
 */
export const apiPut = (endpoint, data = {}, options = {}) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options
  });
};

/**
 * DELETE request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Additional fetch options
 * @returns {Promise<any>} API response data
 */
export const apiDelete = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    method: 'DELETE',
    ...options
  });
};

/**
 * PATCH request
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body data
 * @param {object} options - Additional fetch options
 * @returns {Promise<any>} API response data
 */
export const apiPatch = (endpoint, data = {}, options = {}) => {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...options
  });
};

// Authentication specific API functions

/**
 * Login user
 * @param {object} credentials - Email and password
 * @returns {Promise<object>} Authentication data
 */
export const loginUser = async (credentials) => {
  const response = await apiPost('/auth/login', credentials);
  
  // Save authentication data to cookies
  if (response.token) {
    setAuthCookies(response);
  }
  
  return response;
};

/**
 * Register user
 * @param {object} userData - User registration data
 * @returns {Promise<object>} Registration response
 */
export const registerUser = async (userData) => {
  return await apiPost('/auth/register', userData);
};

/**
 * Refresh authentication token
 * @returns {Promise<object>} New authentication data
 */
export const refreshToken = async () => {
  const authData = getAuthCookies();
  
  if (!authData || !authData.refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const response = await apiPost('/auth/refresh', {
    refreshToken: authData.refreshToken
  });
  
  // Update authentication cookies with new data
  if (response.token) {
    setAuthCookies(response);
  }
  
  return response;
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    // Call logout endpoint if it exists
    await apiPost('/auth/logout');
  } catch (error) {
    console.error('Logout API call failed:', error);
  } finally {
    // Always clear auth cookies
    clearAuthCookies();
  }
};

/**
 * Get current user profile
 * @returns {Promise<object>} User profile data
 */
export const getUserProfile = async () => {
  return await apiGet('/user/profile');
};

// Export the base API request function for custom use cases
export { apiRequest };

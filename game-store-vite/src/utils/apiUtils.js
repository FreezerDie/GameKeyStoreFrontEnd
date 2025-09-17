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
  // Ensure proper URL construction - remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${API_BASE_URL}/${cleanEndpoint}`;
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

/**
 * Update user profile
 * @param {object} profileData - Profile data to update
 * @param {string} profileData.email - New email (optional)
 * @param {string} profileData.name - New name (optional)
 * @param {string} profileData.username - New username (optional)
 * @returns {Promise<object>} Updated profile data
 */
export const updateUserProfile = async (profileData) => {
  console.log('[API] Updating user profile:', profileData);
  
  try {
    const result = await apiPut('/auth/profile', profileData);
    console.log('[API] Successfully updated user profile:', result);
    return result;
  } catch (error) {
    console.error('[API] Error updating user profile:', error);
    throw error;
  }
};

/**
 * Change user password
 * @param {object} passwordData - Password change data
 * @param {string} passwordData.current_password - Current password
 * @param {string} passwordData.new_password - New password
 * @param {string} passwordData.confirm_password - Confirm new password
 * @returns {Promise<object>} Password change result
 */
export const changeUserPassword = async (passwordData) => {
  console.log('[API] Changing user password');
  
  try {
    const result = await apiPost('/auth/change-password', passwordData);
    console.log('[API] Successfully changed user password');
    return result;
  } catch (error) {
    console.error('[API] Error changing user password:', error);
    throw error;
  }
};

/**
 * Delete user account
 * @returns {Promise<object>} Account deletion result
 */
export const deleteUserAccount = async () => {
  console.log('[API] Deleting user account');
  
  try {
    const result = await apiDelete('/auth/account');
    console.log('[API] Successfully deleted user account');
    return result;
  } catch (error) {
    console.error('[API] Error deleting user account:', error);
    throw error;
  }
};

// Game-related API functions

/**
 * Fetch all games from the database
 * @param {object} options - Query options
 * @param {number} options.categoryId - Filter by category ID (optional)
 * @param {boolean} options.includeCategory - Include category details (optional)
 * @param {boolean} options.includeGameKeys - Include game keys with prices (optional)
 * @returns {Promise<object>} Games data with count and array
 */
export const fetchGames = async (options = {}) => {
  const params = new URLSearchParams();
  
  if (options.categoryId) {
    params.append('categoryId', options.categoryId);
  }
  
  if (options.includeCategory) {
    params.append('includeCategory', 'true');
  }
  
  if (options.includeGameKeys) {
    params.append('includeGameKeys', 'true');
  }
  
  const queryString = params.toString();
  const endpoint = queryString ? `/games?${queryString}` : '/games';
  
  console.log(`[API] Fetching games with endpoint: ${endpoint}`, options);
  
  try {
    const result = await apiGet(endpoint);
    console.log(`[API] Successfully fetched games:`, result?.count || 0, 'games found');
    return result;
  } catch (error) {
    console.error(`[API] Error fetching games from ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Fetch a single game by ID
 * @param {number|string} gameId - The ID of the game to fetch
 * @param {object} options - Query options
 * @param {boolean} options.includeCategory - Include category details (optional)
 * @returns {Promise<object>} Single game data
 */
export const fetchGameById = async (gameId, options = {}) => {
  const params = new URLSearchParams();
  
  if (options.includeCategory) {
    params.append('includeCategory', 'true');
  }
  
  const queryString = params.toString();
  const endpoint = queryString ? `/games/${gameId}?${queryString}` : `/games/${gameId}`;
  
  console.log(`[API] Fetching game ${gameId} with endpoint: ${endpoint}`);
  
  try {
    const result = await apiGet(endpoint);
    console.log(`[API] Successfully fetched game ${gameId}:`, result);
    return result;
  } catch (error) {
    console.error(`[API] Error fetching game ${gameId} from ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Fetch games by category ID
 * @param {number} categoryId - The category ID to filter by
 * @param {boolean} includeCategory - Include category details (optional)
 * @returns {Promise<object>} Games data filtered by category
 */
export const fetchGamesByCategory = async (categoryId, includeCategory = false) => {
  console.log(`[API] Fetching games for category ${categoryId}, includeCategory: ${includeCategory}`);
  
  try {
    const result = await fetchGames({ categoryId, includeCategory });
    console.log(`[API] Successfully fetched games for category ${categoryId}:`, result?.count || 0, 'games');
    return result;
  } catch (error) {
    console.error(`[API] Error fetching games for category ${categoryId}:`, error);
    throw error;
  }
};

/**
 * Fetch game keys for a specific game
 * @param {number|string} gameId - The ID of the game to fetch keys for
 * @returns {Promise<array>} Array of game keys data
 */
export const fetchGameKeys = async (gameId) => {
  console.log(`[API] Fetching game keys for game ${gameId}`);
  
  try {
    const result = await apiGet(`/games/${gameId}/keys`);
    console.log(`[API] Successfully fetched game keys for game ${gameId}:`, result?.length || 0, 'keys');
    return result;
  } catch (error) {
    console.error(`[API] Error fetching game keys for game ${gameId}:`, error);
    throw error;
  }
};

// Cart-related API functions

/**
 * Add a game key to cart
 * @param {number|string} gameKeyId - The ID of the game key to add to cart
 * @param {number} quantity - Quantity to add (default: 1)
 * @returns {Promise<object>} Cart item data
 */
export const addGameKeyToCart = async (gameKeyId, quantity = 1) => {
  console.log(`[API] Adding game key ${gameKeyId} to cart (quantity: ${quantity})`);
  
  try {
    const result = await apiPost('/cart/add', {
      game_key_id: gameKeyId,
      quantity: quantity
    });
    console.log(`[API] Successfully added game key ${gameKeyId} to cart:`, result);
    return result;
  } catch (error) {
    console.error(`[API] Error adding game key ${gameKeyId} to cart:`, error);
    throw error;
  }
};

/**
 * Fetch user's cart items
 * @returns {Promise<object>} Cart data with items
 */
export const fetchUserCart = async () => {
  console.log('[API] Fetching user cart');
  
  try {
    const result = await apiGet('/cart/items');
    console.log('[API] Successfully fetched cart:', result?.data?.length || 0, 'items');
    return result;
  } catch (error) {
    console.error('[API] Error fetching cart:', error);
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param {number|string} cartItemId - The ID of the cart item to update
 * @param {object} updateData - Update data
 * @param {number} updateData.quantity - New quantity
 * @returns {Promise<object>} Updated cart item data
 * @deprecated This endpoint may no longer be supported by the new backend API
 * Consider using remove + add approach for quantity updates
 */
export const updateCartItem = async (cartItemId, updateData) => {
  console.log(`[API] Updating cart item ${cartItemId}:`, updateData);
  
  try {
    const result = await apiPut(`/cart/${cartItemId}`, updateData);
    console.log(`[API] Successfully updated cart item ${cartItemId}:`, result);
    return result;
  } catch (error) {
    console.error(`[API] Error updating cart item ${cartItemId}:`, error);
    throw error;
  }
};

/**
 * Remove item from cart
 * @param {number|string} cartItemId - The ID of the cart item to remove
 * @returns {Promise<object>} Response data
 */
export const removeCartItem = async (cartItemId) => {
  console.log(`[API] Removing cart item ${cartItemId}`);
  
  try {
    const result = await apiDelete(`/cart/remove/${cartItemId}`);
    console.log(`[API] Successfully removed cart item ${cartItemId}`);
    return result;
  } catch (error) {
    console.error(`[API] Error removing cart item ${cartItemId}:`, error);
    throw error;
  }
};

/**
 * Clear entire cart
 * @returns {Promise<object>} Response data
 */
export const clearCart = async () => {
  console.log('[API] Clearing cart');
  
  try {
    const result = await apiDelete('/cart/clear');  
    console.log('[API] Successfully cleared cart');
    return result;
  } catch (error) {
    console.error('[API] Error clearing cart:', error);
    throw error;
  }
};

/**
 * Get cart items count
 * @returns {Promise<object>} Cart count data
 */
export const fetchCartCount = async () => {
  console.log('[API] Fetching cart count');
  
  try {
    const result = await apiGet('/cart/count');
    console.log('[API] Successfully fetched cart count:', result?.data || result);
    return result;
  } catch (error) {
    console.error('[API] Error fetching cart count:', error);
    throw error;
  }
};

// S3 and file upload related API functions

/**
 * Get presigned URL for S3 upload
 * @param {object} uploadData - Upload configuration
 * @param {string} uploadData.fileName - Name of the file to upload
 * @param {string} uploadData.contentType - MIME type of the file
 * @param {number} uploadData.expirationMinutes - URL expiration time in minutes
 * @param {string} uploadData.prefix - S3 prefix/folder path
 * @returns {Promise<object>} Presigned URL data
 */
export const getPresignedUploadUrl = async (uploadData) => {
  const { fileName, contentType, expirationMinutes = 15, prefix } = uploadData;
  
  console.log(`[API] Requesting presigned URL for: ${fileName}`);
  
  try {
    const result = await apiPost('/s3/presigned-upload-url', {
      fileName,
      contentType,
      expirationMinutes,
      prefix
    });
    
    console.log(`[API] Successfully received presigned URL for: ${fileName}`);
    return result;
  } catch (error) {
    console.error(`[API] Error getting presigned URL for ${fileName}:`, error);
    throw error;
  }
};

/**
 * Upload file to S3 using presigned URL
 * @param {string} uploadUrl - The presigned URL for upload
 * @param {File} file - The file to upload
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<Response>} Upload response
 */
export const uploadFileToS3 = async (uploadUrl, file, contentType) => {
  // Enhanced file validation and debugging
  console.log(`[API] 🚀 Starting S3 upload for file: ${file.name} (${file.size} bytes)`);
  console.log(`[API] 📍 Upload URL: ${uploadUrl}`);
  console.log(`[API] 📄 Content Type: ${contentType}`);
  
  // ✅ CRITICAL DEBUG: Validate file object
  console.log(`[API] 🔍 FILE DEBUG - Complete file object:`, {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    constructor: file.constructor.name,
    isFile: file instanceof File,
    isBlob: file instanceof Blob
  });
  
  // ✅ CRITICAL: Check if file is actually a File object
  if (!(file instanceof File) && !(file instanceof Blob)) {
    console.error(`[API] ❌ INVALID FILE OBJECT: Expected File/Blob, got:`, typeof file, file);
    throw new Error('Invalid file object: Expected File or Blob');
  }
  
  // ✅ CRITICAL: Check if file has content
  if (file.size === 0) {
    console.error(`[API] ❌ EMPTY FILE: File has zero size`);
    throw new Error('File is empty (0 bytes)');
  }
  
  try {
    console.log(`[API] ⏰ Creating timeout handler...`);
    
    // Create an AbortController for timeout handling
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`[API] ⏰ TIMEOUT! Aborting upload after 60 seconds`);
      abortController.abort();
    }, 60000); // 60 second timeout - more reasonable for larger files
    
    console.log(`[API] 📤 Making fetch request to S3...`);
    
    // For S3 presigned URLs, we need to be very careful about headers
    // The Content-Type should match exactly what was used to generate the presigned URL
    const requestOptions = {
      method: 'PUT',
      body: file,
      signal: abortController.signal,
      mode: 'cors', // Explicitly set CORS mode
      headers: {
        'x-amz-acl': 'public-read',
        ...(contentType ? { 'Content-Type': contentType } : {})
      }
    };
    
    // ✅ CRITICAL DEBUG: Log the exact request being made
    console.log(`[API] 🔍 REQUEST DEBUG - Full request options:`, {
      method: requestOptions.method,
      bodyType: typeof requestOptions.body,
      bodySize: requestOptions.body?.size,
      bodyName: requestOptions.body?.name,
      bodyConstructor: requestOptions.body?.constructor?.name,
      headers: requestOptions.headers,
      mode: requestOptions.mode,
      hasSignal: !!requestOptions.signal
    });
    
    // ✅ CRITICAL: Verify the body is still the file object
    if (requestOptions.body !== file) {
      console.error(`[API] ❌ BODY MISMATCH: Request body is not the original file!`);
      console.error(`[API] Original file:`, file);
      console.error(`[API] Request body:`, requestOptions.body);
      throw new Error('Request body does not match original file object');
    }
    
    const response = await fetch(uploadUrl, requestOptions);
    
    console.log(`[API] ✅ Fetch request completed!`);
    
    // Clear the timeout since the request completed
    clearTimeout(timeoutId);
    console.log(`[API] ⏰ Timeout cleared`);
    
    console.log(`[API] 📊 Upload response status: ${response.status}`);
    console.log(`[API] 📋 Upload response headers:`, [...response.headers.entries()]);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[API] ❌ Upload failed with status ${response.status}:`, errorText);
      
      // Provide more specific error messages based on status code
      let errorMessage = `Upload failed with status: ${response.status}`;
      if (response.status === 403) {
        errorMessage += ' - Access denied. This may be due to incorrect permissions or expired URL.';
      } else if (response.status === 400) {
        errorMessage += ' - Bad request. The file or request format may be invalid.';
      } else if (response.status >= 500) {
        errorMessage += ' - Server error. Please try again later.';
      }
      
      throw new Error(`${errorMessage} - ${errorText}`);
    }
    
    console.log(`[API] 🎉 Successfully uploaded file: ${file.name}`);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`[API] ⏰ Upload timeout for file ${file.name}`);
      throw new Error(`Upload timed out after 60 seconds for file: ${file.name}`);
    }
    
    console.error(`[API] ❌ Error uploading file ${file.name}:`, error);
    console.error(`[API] 🔍 Error details:`, {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Test S3 URL accessibility with a simple HEAD request
 * @param {string} uploadUrl - The presigned URL to test
 * @returns {Promise<boolean>} Whether the URL is accessible
 */
export const testS3UrlAccessibility = async (uploadUrl) => {
  console.log(`[API] 🧪 Testing S3 URL accessibility...`);
  
  try {
    const response = await fetch(uploadUrl.replace(/\?.*$/, ''), {
      method: 'HEAD',
      mode: 'cors'
    });
    console.log(`[API] 🧪 HEAD test result: ${response.status}`);
    return response.status < 400;
  } catch (error) {
    console.error(`[API] 🧪 HEAD test failed:`, error);
    return false;
  }
};

/**
 * Alternative S3 upload using ArrayBuffer (for debugging file payload issues)
 * @param {string} uploadUrl - The presigned URL for upload
 * @param {File} file - The file to upload
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<Response>} Upload response
 */
export const uploadFileToS3_ArrayBuffer = async (uploadUrl, file, contentType) => {
  console.log(`[API] 🔄 Using ArrayBuffer method for S3 upload: ${file.name}`);
  
  try {
    // Convert File to ArrayBuffer
    console.log(`[API] 🔧 Converting file to ArrayBuffer...`);
    const arrayBuffer = await file.arrayBuffer();
    
    console.log(`[API] 🔍 ArrayBuffer conversion result:`, {
      originalFileSize: file.size,
      arrayBufferByteLength: arrayBuffer.byteLength,
      match: file.size === arrayBuffer.byteLength
    });
    
    if (file.size !== arrayBuffer.byteLength) {
      throw new Error(`ArrayBuffer size mismatch: expected ${file.size}, got ${arrayBuffer.byteLength}`);
    }
    
    // Create request with ArrayBuffer
    const requestOptions = {
      method: 'PUT',
      body: arrayBuffer,
      mode: 'cors',
      headers: {
        'x-amz-acl': 'public-read',
        ...(contentType ? { 'Content-Type': contentType } : {})
      }
    };
    
    console.log(`[API] 🔍 ArrayBuffer request options:`, {
      method: requestOptions.method,
      bodyType: typeof requestOptions.body,
      bodyByteLength: requestOptions.body.byteLength,
      headers: requestOptions.headers,
      mode: requestOptions.mode
    });
    
    console.log(`[API] 📤 Making ArrayBuffer fetch request to S3...`);
    const response = await fetch(uploadUrl, requestOptions);
    
    console.log(`[API] 📊 ArrayBuffer upload response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[API] ❌ ArrayBuffer upload failed with status ${response.status}:`, errorText);
      throw new Error(`ArrayBuffer upload failed with status: ${response.status} - ${errorText}`);
    }
    
    console.log(`[API] 🎉 ArrayBuffer upload successful`);
    return response;
  } catch (error) {
    console.error(`[API] ❌ ArrayBuffer upload error:`, error);
    throw error;
  }
};

/**
 * Alternative S3 upload using XMLHttpRequest (for debugging)
 * @param {string} uploadUrl - The presigned URL for upload
 * @param {File} file - The file to upload
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<void>} Upload response
 */
export const uploadFileToS3_XMLHttpRequest = async (uploadUrl, file, contentType) => {
  console.log(`[API] 🔄 Using XMLHttpRequest for S3 upload: ${file.name}`);
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Set up progress tracking
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        console.log(`[API] 📈 Upload progress: ${percentComplete.toFixed(1)}%`);
      }
    });
    
    xhr.addEventListener('load', () => {
      console.log(`[API] 📊 XMLHttpRequest completed with status: ${xhr.status}`);
      if (xhr.status >= 200 && xhr.status < 300) {
        console.log(`[API] 🎉 XMLHttpRequest upload successful`);
        resolve();
      } else {
        console.error(`[API] ❌ XMLHttpRequest upload failed: ${xhr.status} ${xhr.statusText}`);
        
        // Provide more specific error messages based on status code
        let errorMessage = `Upload failed with status: ${xhr.status}`;
        if (xhr.status === 403) {
          errorMessage += ' - Access denied. This may be due to incorrect permissions or expired URL.';
        } else if (xhr.status === 400) {
          errorMessage += ' - Bad request. The file or request format may be invalid.';
        } else if (xhr.status >= 500) {
          errorMessage += ' - Server error. Please try again later.';
        }
        
        reject(new Error(`${errorMessage} ${xhr.statusText ? '- ' + xhr.statusText : ''}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      console.error(`[API] ❌ XMLHttpRequest error occurred`);
      reject(new Error('Network error during upload'));
    });
    
    xhr.addEventListener('timeout', () => {
      console.error(`[API] ⏰ XMLHttpRequest timeout`);
      reject(new Error('Upload timeout after 60 seconds'));
    });
    
    xhr.timeout = 60000; // 60 second timeout to match fetch method
    xhr.open('PUT', uploadUrl);
    
    // Set required headers for S3
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    if (contentType) {
      xhr.setRequestHeader('Content-Type', contentType);
    }
    
    console.log(`[API] 📤 Starting XMLHttpRequest upload...`);
    xhr.send(file);
  });
};

/**
 * Complete file upload process: get presigned URL and upload file
 * @param {File} file - The file to upload
 * @param {string} prefix - S3 prefix/folder path
 * @param {number} expirationMinutes - URL expiration time in minutes
 * @param {boolean} useXHR - Use XMLHttpRequest instead of fetch (for debugging)
 * @returns {Promise<object>} Upload result with file URL
 */
export const uploadFile = async (file, prefix, expirationMinutes = 15, useXHR = false) => {
  // ✅ CRITICAL DEBUG: Validate file object at the entry point of uploadFile
  console.log(`[API] 🎯 uploadFile called with parameters:`, {
    file: {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      constructor: file?.constructor?.name,
      isFile: file instanceof File,
      isBlob: file instanceof Blob
    },
    prefix,
    expirationMinutes,
    useXHR
  });
  
  // ✅ CRITICAL: Early validation of file parameter
  if (!file) {
    console.error(`[API] ❌ uploadFile called with null/undefined file!`);
    throw new Error('No file provided to uploadFile function');
  }
  
  if (!(file instanceof File) && !(file instanceof Blob)) {
    console.error(`[API] ❌ uploadFile called with invalid file object:`, typeof file, file);
    throw new Error('Invalid file object: Expected File or Blob');
  }
  
  const fileName = file.name;
  const contentType = file.type;
  
  console.log(`[API] 📋 Extracted file properties:`, { fileName, contentType });
  
  try {
    // Get presigned URL
    const presignedData = await getPresignedUploadUrl({
      fileName,
      contentType,
      expirationMinutes,
      prefix
    });
    
    // ❌ DISABLED: HEAD test was causing presigned URL invalidation
    // The HEAD test strips authentication query parameters and returns 403,
    // which can cause S3 to mark the presigned URL as compromised/expired
    // 
    // Old problematic code:
    // if (!useXHR) {
    //   const isAccessible = await testS3UrlAccessibility(presignedData.uploadUrl);
    //   if (!isAccessible) {
    //     console.warn(`[API] ⚠️ S3 URL may not be accessible, but continuing with upload...`);
    //   }
    // }
    
    console.log(`[API] ℹ️ Skipping HEAD test to preserve presigned URL integrity`);
    console.log(`[API] 🔗 Proceeding directly to upload with presigned URL`);
    console.log(`[API] 📅 URL expires at: ${presignedData.expiresAt || 'unknown'}`);
    console.log(`[API] 🔒 URL includes authentication signature: ${presignedData.uploadUrl.includes('Signature=') ? 'Yes' : 'No'}`);
    
    // Upload file to S3 - try different methods if needed
    if (useXHR) {
      console.log(`[API] 🔄 Using XMLHttpRequest method`);
      await uploadFileToS3_XMLHttpRequest(presignedData.uploadUrl, file, contentType);
    } else {
      console.log(`[API] 🌐 Using fetch method`);
      
      try {
        await uploadFileToS3(presignedData.uploadUrl, file, contentType);
      } catch (error) {
        // If the direct File upload failed, try ArrayBuffer method
        if (error.message.includes('payload') || error.message.includes('body') || error.message.includes('400')) {
          console.warn(`[API] ⚠️ Direct file upload failed, trying ArrayBuffer method...`);
          console.warn(`[API] Original error:`, error.message);
          
          await uploadFileToS3_ArrayBuffer(presignedData.uploadUrl, file, contentType);
        } else {
          throw error; // Re-throw other errors
        }
      }
    }
    
    // Return the final file data
    return {
      success: true,
      fileName: presignedData.fileName,
      fullPath: presignedData.fullPath,
      uploadUrl: presignedData.uploadUrl,
      expiresAt: presignedData.expiresAt,
      message: presignedData.message
    };
  } catch (error) {
    console.error(`[API] Error in complete upload process for ${fileName}:`, error);
    
    // If fetch failed and we haven't tried XHR yet, try it
    if (!useXHR && (error.message.includes('timeout') || error.message.includes('timed out'))) {
      console.log(`[API] 🔄 Fetch timed out, trying XMLHttpRequest...`);
      return await uploadFile(file, prefix, expirationMinutes, true);
    }
    
    throw error;
  }
};

/**
 * Delete file from S3 storage
 * @param {string} fileName - The full file path/name to delete (e.g., "games/covers/example_image_1694808000.jpg")
 * @returns {Promise<object>} Delete result
 */
export const deleteFile = async (fileName) => {
  console.log(`[API] Deleting file from S3: ${fileName}`);
  
  try {
    const result = await apiRequest('/s3/delete-file', {
      method: 'DELETE',
      body: JSON.stringify({ fileName })
    });
    
    console.log(`[API] Successfully deleted file: ${fileName}`);
    return {
      success: true,
      fileName,
      message: result.message || 'File deleted successfully'
    };
  } catch (error) {
    console.error(`[API] Error deleting file ${fileName}:`, error);
    throw error;
  }
};

// Order-related API functions

/**
 * Create a new order from cart items
 * @param {object} orderData - Order data including billing info, payment info, and cart items
 * @returns {Promise<object>} Created order data
 */
export const createOrder = async (orderData) => {
  console.log('[API] Creating order with data:', orderData);
  
  try {
    const result = await apiPost('/cart/checkout', orderData);
    console.log('[API] Successfully created order:', result);
    return result;
  } catch (error) {
    console.error('[API] Error creating order:', error);
    throw error;
  }
};

/**
 * Get user's order history
 * @returns {Promise<array>} Array of user orders
 */
export const fetchUserOrders = async () => {
  console.log('[API] Fetching user orders');
  
  try {
    const result = await apiGet('/orders');
    console.log('[API] Successfully fetched orders:', result?.data?.length || result?.length || 0, 'orders');
    return result;
  } catch (error) {
    console.error('[API] Error fetching orders:', error);
    throw error;
  }
};

/**
 * Get specific order details by ID
 * @param {number|string} orderId - The ID of the order to fetch
 * @returns {Promise<object>} Order details with items
 */
export const fetchOrderById = async (orderId) => {
  console.log(`[API] Fetching order ${orderId}`);
  
  try {
    const result = await apiGet(`/orders/${orderId}`);
    console.log(`[API] Successfully fetched order ${orderId}:`, result);
    return result;
  } catch (error) {
    console.error(`[API] Error fetching order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Cancel an order (if supported by backend)
 * @param {number|string} orderId - The ID of the order to cancel
 * @returns {Promise<object>} Cancellation result
 */
export const cancelOrder = async (orderId) => {
  console.log(`[API] Cancelling order ${orderId}`);
  
  try {
    const result = await apiPatch(`/orders/${orderId}/cancel`);
    console.log(`[API] Successfully cancelled order ${orderId}`);
    return result;
  } catch (error) {
    console.error(`[API] Error cancelling order ${orderId}:`, error);
    throw error;
  }
};

// Export the base API request function for custom use cases
export { apiRequest };

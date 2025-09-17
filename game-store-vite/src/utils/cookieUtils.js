// Cookie utility functions for managing authentication data

import { decodeJWT, isTokenExpired, getUserFromToken, isStaffUser } from './jwtUtils';

/**
 * Set a cookie with name, value, and expiration
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number|Date} expiresInDays - Number of days until expiration or Date object
 * @param {object} options - Additional cookie options
 */
export const setCookie = (name, value, expiresInDays = 7, options = {}) => {
  // Check if running in browser environment
  if (typeof document === 'undefined') {
    return;
  }
  
  try {
    let expires = '';
    
    if (expiresInDays) {
      const date = expiresInDays instanceof Date ? expiresInDays : new Date();
      if (typeof expiresInDays === 'number') {
        date.setTime(date.getTime() + (expiresInDays * 24 * 60 * 60 * 1000));
      }
      expires = "; expires=" + date.toUTCString();
    }
    
    const path = options.path || '/';
    const secure = options.secure ? '; secure' : '';
    const sameSite = options.sameSite ? `; samesite=${options.sameSite}` : '; samesite=lax';
    
    document.cookie = `${name}=${value || ""}${expires}; path=${path}${secure}${sameSite}`;
  } catch (error) {
    console.error('Error setting cookie:', error);
  }
};

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
export const getCookie = (name) => {
  // Check if running in browser environment
  if (typeof document === 'undefined') {
    return null;
  }
  
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  } catch (error) {
    console.error('Error reading cookie:', error);
    return null;
  }
};

/**
 * Remove a cookie by name
 * @param {string} name - Cookie name
 * @param {string} path - Cookie path (default: '/')
 */
export const removeCookie = (name, path = '/') => {
  // Check if running in browser environment
  if (typeof document === 'undefined') {
    return;
  }
  
  try {
    document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  } catch (error) {
    console.error('Error removing cookie:', error);
  }
};

/**
 * Set authentication data in cookies
 * @param {object} authData - Authentication data from API response
 */
export const setAuthCookies = (authData) => {
  const { token, refreshToken, user, expiresAt } = authData;
  
  // Calculate expiration date from API response
  const expirationDate = new Date(expiresAt);
  
  // Set cookies with the actual expiration time from API
  setCookie('authToken', token, expirationDate, { secure: true, sameSite: 'strict' });
  setCookie('refreshToken', refreshToken, expirationDate, { secure: true, sameSite: 'strict' });
  setCookie('user', JSON.stringify(user), expirationDate, { secure: true, sameSite: 'strict' });
  setCookie('expiresAt', expiresAt, expirationDate, { secure: true, sameSite: 'strict' });
  
  console.log('Authentication cookies set successfully');
};

/**
 * Get authentication data from cookies
 * @returns {object|null} Authentication data or null if not found
 */
export const getAuthCookies = () => {
  const token = getCookie('authToken');
  const refreshToken = getCookie('refreshToken');
  const userStr = getCookie('user');
  const expiresAt = getCookie('expiresAt');
  
  if (!token || !refreshToken || !userStr || !expiresAt) {
    return null;
  }
  
  try {
    const user = JSON.parse(userStr);
    return {
      token,
      refreshToken,
      user,
      expiresAt
    };
  } catch (error) {
    console.error('Error parsing user data from cookies:', error);
    return null;
  }
};

/**
 * Remove all authentication cookies
 */
export const clearAuthCookies = () => {
  removeCookie('authToken');
  removeCookie('refreshToken');
  removeCookie('user');
  removeCookie('expiresAt');
  console.log('Authentication cookies cleared');
};

/**
 * Check if user is authenticated (has valid token)
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const authData = getAuthCookies();
  
  if (!authData) {
    return false;
  }
  
  // Check if token is expired
  const now = new Date();
  const expiresAt = new Date(authData.expiresAt);
  
  if (now >= expiresAt) {
    // Token is expired, clear cookies
    clearAuthCookies();
    return false;
  }
  
  return true;
};

/**
 * Get current user data
 * @returns {object|null} User data or null if not authenticated
 */
export const getCurrentUser = () => {
  try {
    const authData = getAuthCookies();
    if (!authData) {
      console.log('[Auth] No auth data found in cookies');
      return null;
    }

    let userData = null;

    // If we have token, decode it for the most up-to-date user info
    if (authData.token) {
      const userFromToken = getUserFromToken(authData.token);
      if (userFromToken && userFromToken.name) {
        console.log('[Auth] Successfully retrieved user from token:', userFromToken.name);
        userData = userFromToken;
      }
    }

    // Fallback to stored user data if token parsing failed or didn't have name
    if (!userData && authData.user) {
      // Apply same fallback logic to stored user data
      const storedUser = authData.user;
      const displayName = storedUser.name || storedUser.username || storedUser.email?.split('@')[0] || 'User';
      
      userData = {
        ...storedUser,
        name: displayName
      };
      console.log('[Auth] Using stored user data with fallback name:', displayName);
    }

    if (!userData) {
      console.warn('[Auth] No valid user data found');
      return null;
    }

    // Final safety check to ensure we always have a name
    if (!userData.name) {
      userData.name = userData.username || userData.email?.split('@')[0] || 'User';
      console.log('[Auth] Applied final fallback name:', userData.name);
    }

    return userData;
  } catch (error) {
    console.error('[Auth] Error getting current user:', error);
    return null;
  }
};

/**
 * Check if current user is staff
 * @returns {boolean} True if current user is staff, false otherwise
 */
export const isCurrentUserStaff = () => {
  const authData = getAuthCookies();
  if (!authData || !authData.token) {
    return false;
  }

  return isStaffUser(authData.token);
};

/**
 * Get current user's JWT token
 * @returns {string|null} JWT token or null if not authenticated
 */
export const getCurrentToken = () => {
  const authData = getAuthCookies();
  return authData ? authData.token : null;
};

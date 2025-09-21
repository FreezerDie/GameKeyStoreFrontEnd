// Debug utility for authentication issues
import { getAuthCookies, getCurrentUser, getCurrentToken } from './cookieUtils';
import { decodeJWT, getUserFromToken } from './jwtUtils';

/**
 * Debug authentication state and user data
 * This function helps identify where user data might be getting lost
 */
export const debugAuthState = () => {
  console.group('🔍 Authentication Debug');
  
  try {
    // Check if we have auth cookies
    const authData = getAuthCookies();
    console.log('📦 Auth cookies:', authData);
    
    if (!authData) {
      console.error('❌ No authentication data found in cookies');
      console.groupEnd();
      return;
    }
    
    // Check token validity
    const token = getCurrentToken();
    console.log('🎫 Current token:', token ? 'Present' : 'Missing');
    
    if (token) {
      try {
        const decodedToken = decodeJWT(token);
        console.log('🔓 Decoded token payload:', decodedToken);
        
        const userFromToken = getUserFromToken(token);
        console.log('👤 User from token:', userFromToken);
      } catch (tokenError) {
        console.error('🚨 Token decoding error:', tokenError);
      }
    }
    
    // Check stored user data
    console.log('💾 Stored user data:', authData.user);
    
    // Check current user result
    const currentUser = getCurrentUser();
    console.log('✅ getCurrentUser() result:', currentUser);
    
    if (!currentUser) {
      console.error('❌ getCurrentUser() returned null');
    } else {
      console.log('📋 User data fields:');
      console.log('  - ID:', currentUser.id);
      console.log('  - Email:', currentUser.email);
      console.log('  - Name:', currentUser.name);
      console.log('  - Username:', currentUser.username);
      console.log('  - Role:', currentUser.role);
      console.log('  - Is Staff:', currentUser.isStaff);
    }
    
    // Check expiration
    if (authData.expiresAt) {
      const expiration = new Date(authData.expiresAt);
      const now = new Date();
      const isExpired = now >= expiration;
      console.log('⏰ Token expiration:', expiration.toLocaleString());
      console.log('🕐 Current time:', now.toLocaleString());
      console.log('⚠️ Is expired:', isExpired);
    }
    
  } catch (error) {
    console.error('🚨 Debug error:', error);
  }
  
  console.groupEnd();
};

/**
 * Check if user data has all expected fields
 */
export const validateUserData = (userData) => {
  if (!userData) {
    console.warn('⚠️ User data is null or undefined');
    return false;
  }
  
  const requiredFields = ['id', 'email'];
  const optionalFields = ['name', 'username', 'role'];
  
  console.group('✅ User Data Validation');
  
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!userData[field]) {
      console.error(`❌ Missing required field: ${field}`);
      isValid = false;
    } else {
      console.log(`✅ Required field ${field}:`, userData[field]);
    }
  });
  
  optionalFields.forEach(field => {
    if (userData[field]) {
      console.log(`✅ Optional field ${field}:`, userData[field]);
    } else {
      console.warn(`⚠️ Missing optional field: ${field}`);
    }
  });
  
  console.groupEnd();
  return isValid;
};

/**
 * Test cookie operations
 */
export const testCookieOperations = () => {
  console.group('🍪 Cookie Operations Test');
  
  // Check if we can read/write cookies
  try {
    const testValue = 'test_' + Date.now();
    document.cookie = `test_cookie=${testValue}; path=/; max-age=60`;
    
    const cookies = document.cookie.split(';');
    const testCookie = cookies.find(cookie => cookie.trim().startsWith('test_cookie='));
    
    if (testCookie) {
      console.log('✅ Cookie write/read test passed');
      // Clean up test cookie
      document.cookie = 'test_cookie=; path=/; max-age=0';
    } else {
      console.error('❌ Cookie write/read test failed');
    }
  } catch (error) {
    console.error('🚨 Cookie test error:', error);
  }
  
  // Check cookie security settings
  const userAgent = navigator.userAgent;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isHTTPS = window.location.protocol === 'https:';
  
  console.log('🌐 Environment info:');
  console.log('  - Localhost:', isLocalhost);
  console.log('  - HTTPS:', isHTTPS);
  console.log('  - User Agent:', userAgent);
  
  if (!isHTTPS && !isLocalhost) {
    console.warn('⚠️ Secure cookies may not work without HTTPS');
  }
  
  console.groupEnd();
};

/**
 * Run comprehensive auth debug
 */
export const runAuthDiagnostics = () => {
  console.log('🚀 Starting authentication diagnostics...');
  
  testCookieOperations();
  debugAuthState();
  
  const currentUser = getCurrentUser();
  validateUserData(currentUser);
  
  console.log('🏁 Authentication diagnostics complete');
};

// JWT utility functions for decoding and extracting user information

/**
 * Decode JWT token payload (client-side only for reading claims)
 * Note: This doesn't validate the signature - server validation is required
 * @param {string} token - JWT token
 * @returns {object|null} Decoded payload or null if invalid
 */
export const decodeJWT = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64url to regular base64, then parse JSON
    const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired, false otherwise
 */
export const isTokenExpired = (token) => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

/**
 * Get user information from JWT token
 * @param {string} token - JWT token
 * @returns {object|null} User information or null
 */
export const getUserFromToken = (token) => {
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }

  // Create display name with fallbacks - prefer name, then username, then email
  const displayName = payload.name || payload.username || payload.email?.split('@')[0] || 'User';

  return {
    id: payload.id, // Changed from 'nameid' to 'id' to match new JWT claims
    email: payload.email,
    name: displayName, // Use fallback logic for display name
    username: payload.username,
    isStaff: payload.is_staff === 'true' || payload.is_staff === true, // Handle both string and boolean
    role: payload.role,
    roleId: payload.role_id,
    jti: payload.jti,
    iat: payload.iat,
    exp: payload.exp
  };
};

/**
 * Check if user is staff based on JWT token
 * @param {string} token - JWT token
 * @returns {boolean} True if user is staff, false otherwise
 */
export const isStaffUser = (token) => {
  const payload = decodeJWT(token);
  return payload?.is_staff === 'true' || payload?.is_staff === true;
};

/**
 * Get user role from JWT token
 * @param {string} token - JWT token
 * @returns {string|null} User role or null
 */
export const getUserRole = (token) => {
  const payload = decodeJWT(token);
  return payload?.role || null;
};

/**
 * Check if user has specific role
 * @param {string} token - JWT token
 * @param {string} requiredRole - Role to check for
 * @returns {boolean} True if user has the role, false otherwise
 */
export const hasRole = (token, requiredRole) => {
  const userRole = getUserRole(token);
  return userRole === requiredRole;
};

/**
 * Check if user has any of the specified roles
 * @param {string} token - JWT token
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean} True if user has any of the roles, false otherwise
 */
export const hasAnyRole = (token, roles) => {
  const userRole = getUserRole(token);
  return roles.includes(userRole);
};

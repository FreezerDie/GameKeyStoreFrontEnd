// Test utility for demonstrating staff functionality
// This is for testing purposes only

import { decodeJWT, isStaffUser, getUserFromToken } from './jwtUtils';

// Example JWT payload from your requirements
const exampleStaffToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI3ODkiLCJlbWFpbCI6InN0YWZmQGdhbWVzdG9yZS5jb20iLCJuYW1lIjoiU3RhZmYgTWVtYmVyIiwidXNlcm5hbWUiOiJzdGFmZm1lbWJlciIsImlzX3N0YWZmIjoidHJ1ZSIsInJvbGUiOiJNb2RlcmF0b3IiLCJyb2xlX2lkIjoiMyIsImp0aSI6ImMzZDRlNWY2LWc3aDgtOTAxMi1jZGVmLWdoMzQ1Njc4OTAxMiIsImlhdCI6IjE3MjYzMTI4MDAiLCJpc3MiOiJHYW1lS2V5U3RvcmUiLCJhdWQiOiJHYW1lS2V5U3RvcmUiLCJleHAiOjE3MjY5MTc2MDB9.EXAMPLE_SIGNATURE";

const exampleRegularToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiIxMjMiLCJlbWFpbCI6InVzZXJAZ2FtZXN0b3JlLmNvbSIsIm5hbWUiOiJSZWd1bGFyIFVzZXIiLCJ1c2VybmFtZSI6InJlZ3VsYXJ1c2VyIiwiaXNfc3RhZmYiOiJmYWxzZSIsInJvbGUiOiJDdXN0b21lciIsInJvbGVfaWQiOiIxIiwianRpIjoiYTFiMmMzZDQtZTVmNi03ODkwLWFiY2QtZWYxMjM0NTY3ODkwIiwiaWF0IjoiMTcyNjMxMjgwMCIsImlzcyI6IkdhbWVLZXlTdG9yZSIsImF1ZCI6IkdhbWVLZXlTdG9yZSIsImV4cCI6MTcyNjkxNzYwMH0.EXAMPLE_SIGNATURE";

/**
 * Test JWT utilities with example data
 */
export const testJWTUtils = () => {
  console.log('=== Testing JWT Utils ===');
  
  // Test staff token
  console.log('Staff Token Test:');
  const staffPayload = decodeJWT(exampleStaffToken);
  console.log('Decoded payload:', staffPayload);
  console.log('Is staff user:', isStaffUser(exampleStaffToken));
  console.log('User from token:', getUserFromToken(exampleStaffToken));
  
  console.log('\nRegular Token Test:');
  const regularPayload = decodeJWT(exampleRegularToken);
  console.log('Decoded payload:', regularPayload);
  console.log('Is staff user:', isStaffUser(exampleRegularToken));
  console.log('User from token:', getUserFromToken(exampleRegularToken));
};

/**
 * Simulate staff login for testing
 * In real app, this would come from your API
 */
export const simulateStaffLogin = () => {
  const staffAuthData = {
    token: exampleStaffToken,
    refreshToken: 'refresh_token_here',
    user: {
      id: "789",
      email: "staff@gamestore.com",
      name: "Staff Member",
      username: "staffmember",
      isStaff: true,
      role: "Moderator",
      roleId: "3"
    },
    expiresAt: new Date(1726917600 * 1000).toISOString() // Convert unix timestamp to ISO string
  };
  
  return staffAuthData;
};

/**
 * Simulate regular user login for testing
 */
export const simulateRegularLogin = () => {
  const regularAuthData = {
    token: exampleRegularToken,
    refreshToken: 'refresh_token_here',
    user: {
      id: "123",
      email: "user@gamestore.com", 
      name: "Regular User",
      username: "regularuser",
      isStaff: false,
      role: "Customer",
      roleId: "1"
    },
    expiresAt: new Date(1726917600 * 1000).toISOString()
  };
  
  return regularAuthData;
};

// Run test when this file is imported (for development only)
if (process.env.NODE_ENV === 'development') {
  // Uncomment to run tests
  // testJWTUtils();
}

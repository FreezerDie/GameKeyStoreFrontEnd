// Authentication Context for managing user state throughout the app

import { createContext, useContext, useState, useEffect } from 'react';
import { getAuthCookies, clearAuthCookies, isAuthenticated, getCurrentUser, isCurrentUserStaff } from '../utils/cookieUtils';
import { logoutUser } from '../utils/apiUtils';

const AuthContext = createContext({
  user: null,
  authenticated: false,
  isStaff: false,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Only initialize if we're in browser environment
        if (typeof window !== 'undefined') {
          const isAuth = isAuthenticated();
          const userData = getCurrentUser();
          const staffStatus = isCurrentUserStaff();
          
          setAuthenticated(isAuth);
          setUser(userData);
          setIsStaff(staffStatus);
        } else {
          // Server-side or initial load - set defaults
          setAuthenticated(false);
          setUser(null);
          setIsStaff(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthenticated(false);
        setUser(null);
        setIsStaff(false);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initializeAuth, 0);
    
    return () => clearTimeout(timer);
  }, []);

  // Login function - called after successful login
  const login = (authData) => {
    setAuthenticated(true);
    setUser(authData.user);
    // Check staff status after login
    setIsStaff(isCurrentUserStaff());
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthenticated(false);
      setUser(null);
      setIsStaff(false);
      clearAuthCookies();
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
    // Update staff status when user data changes
    setIsStaff(isCurrentUserStaff());
  };

  const value = {
    user,
    authenticated,
    isStaff,
    loading,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

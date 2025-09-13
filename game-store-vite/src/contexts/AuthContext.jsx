// Authentication Context for managing user state throughout the app

import { createContext, useContext, useState, useEffect } from 'react';
import { getAuthCookies, clearAuthCookies, isAuthenticated, getCurrentUser } from '../utils/cookieUtils';
import { logoutUser } from '../utils/apiUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const isAuth = isAuthenticated();
        const userData = getCurrentUser();
        
        setAuthenticated(isAuth);
        setUser(userData);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function - called after successful login
  const login = (authData) => {
    setAuthenticated(true);
    setUser(authData.user);
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
      clearAuthCookies();
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    authenticated,
    loading,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

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
      console.log('[AuthContext] Starting auth initialization...');

      try {
        // Only initialize if we're in browser environment
        if (typeof window !== 'undefined') {
          console.log('[AuthContext] Browser environment detected, checking auth state...');


          const isAuth = isAuthenticated();
          console.log('[AuthContext] isAuthenticated result:', isAuth);

          const userData = getCurrentUser();
          console.log('[AuthContext] getCurrentUser result:', userData);

          const staffStatus = isCurrentUserStaff();
          console.log('[AuthContext] isCurrentUserStaff result:', staffStatus);
          
          console.log('[AuthContext] Setting auth state:', {
            authenticated: isAuth,
            user: userData ? { 
              id: userData.id, 
              email: userData.email, 
              name: userData.name, 
              username: userData.username 
            } : null,
            isStaff: staffStatus
          });
          
          setAuthenticated(isAuth);
          setUser(userData);
          setIsStaff(staffStatus);
          
          // Additional validation checks
          if (isAuth && !userData) {
            console.error('[AuthContext] Authentication mismatch: user is authenticated but no user data found!');
          }
          
          if (isAuth && userData && !userData.email) {
            console.warn('[AuthContext] Warning: User is authenticated but has no email');
          }
          
          if (isAuth && userData && !userData.name) {
            console.warn('[AuthContext] Warning: User is authenticated but has no display name');
          }
          
        } else {
          // Server-side or initial load - set defaults
          console.log('[AuthContext] Server-side initialization');
          setAuthenticated(false);
          setUser(null);
          setIsStaff(false);
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
        setAuthenticated(false);
        setUser(null);
        setIsStaff(false);
      } finally {
        console.log('[AuthContext] Auth initialization complete, setting loading to false');
        setLoading(false);
      }
    };

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(initializeAuth, 0);
    
    return () => clearTimeout(timer);
  }, []);

  // Login function - called after successful login
  const login = (authData) => {
    try {
      console.log('[AuthContext] Login function called with:', authData?.user?.name);
      
      // Ensure user data has a name field with fallback logic
      const userData = authData.user;
      if (userData && !userData.name) {
        userData.name = userData.username || userData.email?.split('@')[0] || 'User';
        console.log('[AuthContext] Applied fallback name during login:', userData.name);
      }
      
      setAuthenticated(true);
      setUser(userData);
      // Check staff status after login
      setIsStaff(isCurrentUserStaff());
      
      console.log('[AuthContext] Login completed successfully');
    } catch (error) {
      console.error('[AuthContext] Error during login:', error);
    }
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
    try {
      console.log('[AuthContext] Update user function called with:', userData?.name);
      
      // Ensure user data has a name field with fallback logic
      if (userData && !userData.name) {
        userData.name = userData.username || userData.email?.split('@')[0] || 'User';
        console.log('[AuthContext] Applied fallback name during update:', userData.name);
      }
      
      setUser(userData);
      // Update staff status when user data changes
      setIsStaff(isCurrentUserStaff());
      
      console.log('[AuthContext] User update completed successfully');
    } catch (error) {
      console.error('[AuthContext] Error during user update:', error);
    }
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

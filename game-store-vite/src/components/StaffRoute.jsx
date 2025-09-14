// Staff-only route protection component

import { useAuth } from '../contexts/AuthContext';
import { isCurrentUserStaff } from '../utils/cookieUtils';
import { Navigate, useLocation } from 'react-router-dom';

const StaffRoute = ({ children }) => {
  const { authenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check staff status from JWT token
  const isStaff = isCurrentUserStaff();

  // Redirect to home if not staff
  if (!isStaff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p>You don't have permission to access this area. Staff privileges required.</p>
            <button 
              onClick={() => window.history.back()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Allow access if user is staff
  return children;
};

export default StaffRoute;

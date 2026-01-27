import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../utils/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string; // Optional permission required to access this route
  fallback?: React.ReactNode; // Optional fallback UI when permission is missing
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  permission,
  fallback 
}) => {
  const { isAuthenticated, loading, permissions, roles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('ProtectedRoute - Auth state changed:', { isAuthenticated, loading }); // Debug log
    if (!loading && !isAuthenticated) {
      console.log('ProtectedRoute - Redirecting to login'); // Debug log
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E53E3E] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Return null while navigation happens
  }

  // Check permission if specified (admin and super_admin have all permissions)
  if (permission && !hasPermission(permissions, permission, roles)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#E53E3E] text-white rounded-lg hover:bg-[#D32F2F] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

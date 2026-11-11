import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Loader2, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-canvas flex flex-col items-center justify-center p-6 text-navy-900">
        <div className="w-10 h-10 rounded bg-navy-900 text-white flex items-center justify-center shadow-subtle mb-4">
          <BookOpen className="w-5 h-5 text-warm-100" />
        </div>
        <div className="flex items-center gap-2.5 text-xs text-navy-600 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-accent-600" />
          <span>Restoring PRANPAN workspace session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated user to login with return path state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;

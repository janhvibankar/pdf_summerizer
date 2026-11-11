import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Don't redirect while determining session state
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;


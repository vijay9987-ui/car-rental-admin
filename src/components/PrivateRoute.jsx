import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  // Check if adminUser exists in sessionStorage
  const storedUser = sessionStorage.getItem('adminUser');
  const isAuthenticated = !!storedUser; // true if user info exists

  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;

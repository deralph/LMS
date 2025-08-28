// components/ProtectedRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const ProtectedRoute = ({ children, role }) => {
  const { isLoggedIn, userData } = useContext(AppContext);

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (role && userData && userData.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
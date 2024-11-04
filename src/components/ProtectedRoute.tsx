import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('user'); // Verifica si hay un usuario autenticado en el localStorage

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
 
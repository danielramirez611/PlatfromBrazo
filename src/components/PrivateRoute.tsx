import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../pages/Auth/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user } = useAuth();
    return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    return user && user.role === 'admin' ? children : <Navigate to="/account" />;
};

export { PrivateRoute, AdminRoute };

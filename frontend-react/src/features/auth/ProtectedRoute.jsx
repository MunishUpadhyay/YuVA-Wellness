import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import LoadingScreen from '../../components/ui/Loading';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    // MANDATORY FIX: Check loading BEFORE checking user
    if (loading) {
        // Return LoadingScreen if it exists, otherwise null
        return <LoadingScreen />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthContext';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import { AnimatePresence } from 'framer-motion';
import { ChatProvider } from '../features/chat/ChatContext';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Mood from '../features/mood/Mood';
import Chat from '../features/chat/Chat';
import Journal from '../features/journal/Journal';
import Analytics from '../pages/Analytics';
import Resources from '../pages/Resources';
// Ensure Navbar is inside a Layout if needed
import Navbar from '../components/layout/Navbar';
import PageTransition from '../components/layout/PageTransition';

const Layout = ({ children }) => (
    <>
        <Navbar />
        <div className="pt-16 min-h-screen bg-gray-900">
            <PageTransition>
                {children}
            </PageTransition>
        </div>
    </>
);

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* Public Routes - Accessible without auth */}

                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/resources" element={<Layout><Resources /></Layout>} />

                {/* Protected Routes - Gated by ProtectedRoute */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Layout><Home /></Layout>} />
                    <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                    <Route path="/mood" element={<Layout><Mood /></Layout>} />
                    <Route path="/chat" element={<Layout><Chat /></Layout>} />
                    <Route path="/journal" element={<Layout><Journal /></Layout>} />
                    <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
                </Route>

                {/* Catch all - Redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

const AppRouter = () => {
    return (
        <Router>
            <AuthProvider>
                <ChatProvider>
                    <AnimatedRoutes />
                </ChatProvider>
            </AuthProvider>
        </Router>
    );
};

export default AppRouter;

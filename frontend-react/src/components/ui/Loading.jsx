import React from 'react';

const LoadingScreen = () => {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            <span className="ml-4 text-white text-lg">Loading...</span>
        </div>
    );
};

export default LoadingScreen;

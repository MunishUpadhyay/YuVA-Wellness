import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiClient from '../../services/apiClient';
import { API_ENDPOINTS } from '../../constants/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkSession = async () => {
            try {
                console.log('[AuthContext] 🟢 Checking session...');
                const result = await ApiClient.get(API_ENDPOINTS.AUTH.CHECK);

                if (result.success && result.data) {
                    setUser(result.data);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error('[AuthContext] 🚨 Session check failed:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    const login = async (identifier, password) => {
        setLoading(true);
        setError(null);
        try {
            const result = await ApiClient.post(API_ENDPOINTS.AUTH.LOGIN, { identifier, password });

            if (result.success) {
                const data = result.data;
                const userData = data.user || data;

                // Store token if provided
                if (data.access_token) {
                    localStorage.setItem('access_token', data.access_token);
                }

                setUser(userData);
                return { success: true };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = async (credential) => {
        setLoading(true);
        setError(null);
        try {
            const result = await ApiClient.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, { credential });

            if (result.success) {
                const data = result.data;
                const userData = data.user || data;

                if (data.access_token) {
                    localStorage.setItem('access_token', data.access_token);
                }

                setUser(userData);
                return { success: true };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (email, password, firstName, lastName) => {
        setLoading(true);
        setError(null);
        try {
            const result = await ApiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
                email,
                password,
                first_name: firstName,
                last_name: lastName
            });
            if (result.success) {
                const data = result.data;
                const userData = data.user || data;

                if (data.access_token) {
                    localStorage.setItem('access_token', data.access_token);
                }

                setUser(userData);
                return { success: true };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const loginAsGuest = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await ApiClient.post(API_ENDPOINTS.AUTH.GUEST, {});
            if (result.success) {
                setUser(result.data.user || { isGuest: true, id: 'guest' });
                return { success: true };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const forgotPassword = async (email) => {
        try {
            const result = await ApiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const verifyResetOTP = async (resetToken, otp) => {
        try {
            const result = await ApiClient.post(API_ENDPOINTS.AUTH.VERIFY_RESET_OTP, { reset_token: resetToken, otp: otp });
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const resetPassword = async (resetToken, newPassword) => {
        try {
            const result = await ApiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { reset_token: resetToken, new_password: newPassword });
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.CHANGE_PASSWORD}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await response.json();
            if (!response.ok) {
                return { success: false, error: data.detail || 'Failed to update password' };
            }

            return { success: true, message: data.message };
        } catch (error) {
            console.error('Password update error:', error);
            return { success: false, error: 'Network error occurred while updating password' };
        }
    };

    const logout = async () => {
        try {
            await ApiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            localStorage.removeItem('access_token');
            setUser(null);
        }
    };

    const authValue = {
        user,
        loading,
        error,
        login,
        googleLogin,
        register,
        loginAsGuest,
        logout,
        changePassword,
        setUser,
        forgotPassword,
        verifyResetOTP,
        resetPassword
    };

    return (
        <AuthContext.Provider value={authValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

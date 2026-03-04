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
                console.log('[AuthContext] 🔍 Session check result:', result);

                if (result.success && result.data) {
                    console.log('[AuthContext] ✅ Authenticated! User:', result.data);

                    let restoredUser = result.data;
                    const token = localStorage.getItem('access_token');
                    if (token) {
                        try {
                            const { jwtDecode } = await import('jwt-decode');
                            const decoded = jwtDecode(token);
                            restoredUser = {
                                ...restoredUser,
                                first_name: restoredUser.first_name || decoded.first_name
                            };
                        } catch (e) {
                            console.error('Failed to decode token on checkSession', e);
                        }
                    }
                    setUser(restoredUser);
                } else {
                    console.log('[AuthContext] ❌ Not authenticated (Result success: false or no data)');
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
            console.log('[AuthContext] Logging in...', { identifier });
            // Use identifier for email/phone
            const result = await ApiClient.post(API_ENDPOINTS.AUTH.LOGIN, { identifier, password });
            console.log('[AuthContext] Login result:', result);

            if (result.success) {
                const data = result.data;

                // Check if 2FA is required
                if (data.requires_otp) {
                    console.log('[AuthContext] 2FA Required. Temp Token:', data.temp_token);
                    return {
                        success: true,
                        requiresOTP: true,
                        tempToken: data.temp_token,
                        message: data.message
                    };
                }

                const userData = data.user || data;
                console.log('[AuthContext] Login success, setting user:', userData);
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

    const verifyOTP = async (tempToken, otp) => {
        setLoading(true);
        setError(null);
        try {
            console.log('[AuthContext] Verifying OTP...');
            const result = await ApiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { temp_token: tempToken, otp });

            if (result.success) {
                console.log('[AuthContext] OTP Verified! User:', result.data.user);

                // Store token
                if (result.data.access_token) {
                    localStorage.setItem('access_token', result.data.access_token);

                    // Decode token to ensure we have latest claims
                    try {
                        const { jwtDecode } = await import('jwt-decode');
                        const decoded = jwtDecode(result.data.access_token);
                        console.log('[AuthContext] Decoded token:', decoded);

                        // Merge decoded data with user response safely
                        const userWithProfile = {
                            ...result.data.user,
                            first_name: result.data.user?.first_name || decoded.first_name || result.data.user?.email?.split('@')[0]
                        };
                        setUser(userWithProfile);
                    } catch (e) {
                        console.error('Token decode failed', e);
                        setUser(result.data.user);
                    }
                } else {
                    setUser(result.data.user);
                }

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

    const resendOTP = async (tempToken) => {
        try {
            const result = await ApiClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, { temp_token: tempToken });
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (email, password, firstName, lastName, otp) => {
        setLoading(true);
        setError(null);
        try {
            const result = await ApiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
                email,
                password,
                first_name: firstName,
                last_name: lastName,
                otp
            });
            if (result.success) {
                setUser(result.data.user || result.data);
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

    const generateOTP = async (email) => {
        try {
            const result = await ApiClient.post(API_ENDPOINTS.AUTH.OTP_GENERATE, { email });
            return result; // { success: true/false, ... }
        } catch (error) {
            return { success: false, error: error.message };
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

    const logout = async () => {
        try {
            await ApiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
        } catch (err) {
            console.error('Logout failed', err);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, loginAsGuest, logout, setUser, generateOTP, verifyOTP, resendOTP, forgotPassword, verifyResetOTP, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

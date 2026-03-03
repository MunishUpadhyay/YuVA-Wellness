import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { Eye, EyeOff, LogIn, UserPlus, Play, AlertTriangle, Info, Phone, LifeBuoy, User } from 'lucide-react';
import styles from '../styles/pages/Login.module.css';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { cn } from '../utils/utils';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [otp, setOtp] = useState('');

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [tempToken, setTempToken] = useState(null);
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
    const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);

    const { login, register, loginAsGuest, verifyOTP, resendOTP } = useAuth();
    const navigate = useNavigate();

    const clearState = () => {
        setMessage({ text: '', type: '' });
        setOtp('');
        setTempToken(null);
        setRequiresTwoFactor(false);
        setFirstName('');
        setLastName('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            // REGISTER FLOW
            if (!isLogin) {
                const result = await register(email, password, firstName, lastName);
                if (result.success) {
                    setMessage({ text: 'Account created! Switching to login...', type: 'success' });
                    setTimeout(() => {
                        setIsLogin(true);
                        setPassword('');
                        clearState();
                    }, 1500);
                } else {
                    setMessage({ text: result.error || 'Registration failed.', type: 'error' });
                }
                setLoading(false);
                return;
            }

            // LOGIN FLOW - STAGE 2 (OTP)
            if (requiresTwoFactor && tempToken) {
                const result = await verifyOTP(tempToken, otp);
                if (result.success) {
                    setMessage({ text: 'Login successful!', type: 'success' });
                    navigate('/');
                } else {
                    setMessage({ text: result.error || 'Invalid OTP.', type: 'error' });
                    setLoading(false);
                }
                return;
            }

            // LOGIN FLOW - STAGE 1 (Credentials)
            const result = await login(email, password);
            if (result.success) {
                if (result.requiresOTP) {
                    setTempToken(result.tempToken);
                    setRequiresTwoFactor(true);
                    setMessage({ text: 'Verification code sent.', type: 'info' });
                    setLoading(false);
                } else {
                    setMessage({ text: 'Login successful!', type: 'success' });
                    navigate('/');
                }
            } else {
                setMessage({ text: result.error || 'Login failed.', type: 'error' });
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: 'An unexpected error occurred.', type: 'error' });
            setLoading(false);
        }
    };

    const handleGuest = async () => {
        setLoading(true);
        const result = await loginAsGuest();
        if (result.success) {
            navigate('/');
        } else {
            setMessage({ text: 'Guest login failed.', type: 'error' });
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        clearState();
    };

    return (
        <div className="min-h-screen flex bg-slate-950 text-slate-200 font-sans">
            {/* LEFT SIDE - VISUAL */}
            {/* LEFT SIDE - VISUAL */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 border-r border-slate-800">
                {/* 1. Background Image (Z-0) */}
                <img
                    src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=2000&auto=format&fit=crop"
                    alt="Wellness Nature"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />

                {/* 2. Gradient Overlay (Z-10) - Lighter for visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10"></div>

                {/* 3. Content (Z-20) */}
                <div className="relative z-20 flex flex-col justify-between p-12 w-full h-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">Y</span>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight drop-shadow-md">YuVA Wellness</span>
                    </div>

                    <div className="space-y-6 mb-12">
                        <h2 className="text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-lg">
                            Find your inner <br />
                            <span className="text-teal-400">sanctuary.</span>
                        </h2>
                        <p className="text-lg text-slate-100 max-w-md font-medium leading-relaxed drop-shadow-md">
                            A private space to reflect, heal, and grow — built for your mental clarity.
                        </p>
                    </div>

                    <div className="text-sm text-slate-400 font-medium">
                        © 2026 YuVA Wellness
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative">
                {/* Background Blobs for Mobile */}
                <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
                    <div className={cn(styles.glowBlob, styles.blob1)}></div>
                </div>

                <div className="w-full max-w-md space-y-8 relative z-10">
                    {/* Header (Mobile Logo) */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-white font-bold text-xl">Y</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">YuVA Wellness</h1>
                    </div>

                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-slate-400">
                            {isLogin
                                ? 'Sign in to access your wellness dashboard'
                                : 'Start your journey with us today'
                            }
                        </p>
                    </div>

                    {/* Guest Access */}
                    <Button
                        variant="outline"
                        onClick={handleGuest}
                        className="w-full h-12 border-slate-700 hover:bg-slate-800 hover:text-white"
                        disabled={loading}
                    >
                        <Play size={18} className="mr-2" />
                        Continue as Guest
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-950 px-2 text-slate-500">Or continue with email</span>
                        </div>
                    </div>

                    {/* Auth Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Registration Fields */}
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                <div className="space-y-2">
                                    <Input
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Last Name (Optional)"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading || requiresTwoFactor}
                                icon={User}
                            />
                        </div>

                        {/* Password */}
                        {!requiresTwoFactor && (
                            <div className="space-y-2 relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    minLength={isLogin ? undefined : 8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        )}

                        {/* OTP Field */}
                        {requiresTwoFactor && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary-light text-center">
                                    Enter the 6-digit code sent to <strong>{email}</strong>
                                </div>
                                <Input
                                    type="text"
                                    placeholder="0 0 0 0 0 0"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="text-center tracking-widest text-2xl h-14 font-mono"
                                    maxLength={6}
                                />
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            setLoading(true);
                                            const res = await resendOTP(tempToken);
                                            if (res.success) {
                                                if (res.data && res.data.temp_token) {
                                                    setTempToken(res.data.temp_token);
                                                }
                                                setMessage({ text: 'Code resent successfully!', type: 'success' });
                                            } else {
                                                setMessage({ text: res.error || 'Failed to resend code.', type: 'error' });
                                            }
                                            setLoading(false);
                                        }}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                requiresTwoFactor ? 'Verify Securely' : (isLogin ? 'Sign In' : 'Create Account')
                            )}
                        </Button>
                    </form>

                    {/* Error Messages */}
                    {message.text && (
                        <div className={cn(
                            "p-4 rounded-lg text-sm flex items-center gap-3 animate-fade-in",
                            message.type === 'error' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                message.type === 'success' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                    "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        )}>
                            {message.type === 'error' && <AlertTriangle size={18} />}
                            {message.type === 'info' && <Info size={18} />}
                            {message.text}
                        </div>
                    )}

                    {/* Toggle */}
                    <div className="text-center text-sm text-slate-400">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={toggleMode}
                            className="text-primary hover:text-primary-light font-medium transition-colors"
                        >
                            {isLogin ? 'Sign up for free' : 'Log in'}
                        </button>
                    </div>
                </div>

                {/* Crisis Button (Fixed) */}
                <div className="absolute bottom-6 right-6">
                    <Button
                        variant="destructive"
                        size="icon"
                        className="rounded-full shadow-lg shadow-red-500/20 w-12 h-12"
                        onClick={() => setIsCrisisModalOpen(true)}
                        title="Crisis Support"
                    >
                        <LifeBuoy size={24} />
                    </Button>
                </div>
            </div>

            {/* Crisis Modal */}
            {isCrisisModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <Card className="w-full max-w-md bg-slate-900 border-red-900/50 shadow-2xl shadow-red-900/20">
                        <div className="flex flex-row items-center justify-between p-6 pb-2">
                            <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                                <AlertTriangle size={24} />
                                Crisis Support
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsCrisisModalOpen(false)}>×</Button>
                        </div>
                        <CardContent className="space-y-4 pt-2">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                <p className="text-red-200 font-medium mb-1">Immediate Danger?</p>
                                <p className="text-3xl font-bold text-white">Call 911</p>
                            </div>
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start text-slate-200 border-slate-700 hover:bg-slate-800 h-auto py-3">
                                    <Phone size={20} className="mr-3 text-slate-400" />
                                    <div className="text-left">
                                        <div className="text-xs text-slate-400">Crisis Text Line</div>
                                        <div className="font-bold">Text HOME to 741741</div>
                                    </div>
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-slate-200 border-slate-700 hover:bg-slate-800 h-auto py-3">
                                    <Phone size={20} className="mr-3 text-slate-400" />
                                    <div className="text-left">
                                        <div className="text-xs text-slate-400">Suicide and Crisis Lifeline</div>
                                        <div className="font-bold">Call 988</div>
                                    </div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Login;
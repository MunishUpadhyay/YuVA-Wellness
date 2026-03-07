import React, { useState, useEffect, useRef } from 'react';
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
    const [isResetMode, setIsResetMode] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
    const [showRecoveryModal, setShowRecoveryModal] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');

    const { login, googleLogin, register, loginAsGuest, resetPasswordWithRecovery } = useAuth();
    const navigate = useNavigate();
    const googleButtonRef = useRef(null);

    // Initialize Google Sign-In
    useEffect(() => {
        if (!window.google) return;

        const handleCredentialResponse = async (response) => {
            setLoading(true);
            const result = await googleLogin(response.credential);
            if (result.success) {
                navigate('/');
            } else {
                setMessage({ text: result.error || 'Google login failed.', type: 'error' });
                setLoading(false);
            }
        };

        const GOOGLE_CLIENT_ID = "9078763119-vh2on0ncvmdo88hrb5p65uijjcgqtgum.apps.googleusercontent.com";
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
            googleButtonRef.current,
            { theme: "outline", size: "large", width: "100%", text: "continue_with" }
        );
    }, [googleLogin, navigate]);

    const clearState = () => {
        setMessage({ text: '', type: '' });
        setFirstName('');
        setLastName('');
        setRecoveryCode('');
        setNewPassword('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            if (isResetMode) {
                // Password Reset with Recovery Code
                const result = await resetPasswordWithRecovery(email, recoveryCode, newPassword);
                if (result.success) {
                    setMessage({ text: 'Password reset successful! You can now log in.', type: 'success' });
                    setTimeout(() => {
                        setIsResetMode(false);
                        setIsLogin(true);
                        clearState();
                    }, 2000);
                } else {
                    setMessage({ text: result.error || 'Reset failed.', type: 'error' });
                }
            } else if (!isLogin) {
                // Register
                const result = await register(email, password, firstName, lastName);
                if (result.success) {
                    setGeneratedCode(result.recovery_code);
                    setShowRecoveryModal(true);
                } else {
                    setMessage({ text: result.error || 'Registration failed.', type: 'error' });
                }
            } else {
                // Login
                const result = await login(email, password);
                if (result.success) {
                    setMessage({ text: 'Login successful!', type: 'success' });
                    navigate('/');
                } else {
                    setMessage({ text: result.error || 'Login failed.', type: 'error' });
                }
            }
        } catch (err) {
            console.error(err);
            setMessage({ text: 'An unexpected error occurred.', type: 'error' });
        } finally {
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
        setIsResetMode(false);
        clearState();
    };

    return (
        <div className="min-h-screen flex bg-slate-950 text-slate-200 font-sans">
            {/* LEFT SIDE - VISUAL */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 border-r border-slate-800">
                <img
                    src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=2000&auto=format&fit=crop"
                    alt="Wellness Nature"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent z-10"></div>
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
                <div className="w-full max-w-md space-y-8 relative z-10">
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="text-white font-bold text-xl">Y</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">YuVA Wellness</h1>
                    </div>

                    <div className={cn("text-center lg:text-left", showRecoveryModal && "opacity-20 pointer-events-none")}>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {isResetMode ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-slate-400">
                            {isResetMode
                                ? 'Use your unique recovery code to set a new password'
                                : isLogin
                                    ? 'Sign in to access your wellness dashboard'
                                    : 'Start your journey with us today'}
                        </p>
                    </div>

                    {!isResetMode && (
                        <div className={cn("grid grid-cols-1 gap-4", showRecoveryModal && "opacity-20 pointer-events-none")}>
                            <div ref={googleButtonRef} className="w-full overflow-hidden rounded-lg"></div>

                            <Button
                                variant="outline"
                                onClick={handleGuest}
                                className="w-full h-12 border-slate-700 hover:bg-slate-800 hover:text-white"
                                disabled={loading}
                            >
                                <Play size={18} className="mr-2" />
                                Continue as Guest
                            </Button>
                        </div>
                    )}

                    {!isResetMode && (
                        <div className={cn("relative", showRecoveryModal && "opacity-20 pointer-events-none")}>
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-800"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-950 px-2 text-slate-500">Or continue with email</span>
                            </div>
                        </div>
                    )}

                    {/* Auth Form */}
                    <form onSubmit={handleSubmit} className={cn("space-y-4", showRecoveryModal && "opacity-20 pointer-events-none")}>
                        {isResetMode ? (
                            <div className="space-y-4 animate-fade-in">
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="Confirm Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    icon={User}
                                />
                                <Input
                                    type="text"
                                    name="recoveryCode"
                                    placeholder="10-Digit Recovery Code"
                                    value={recoveryCode}
                                    onChange={(e) => setRecoveryCode(e.target.value)}
                                    required
                                    disabled={loading}
                                    icon={Shield}
                                />
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        placeholder="Set New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {!isLogin && (
                                    <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                        <Input
                                            name="firstName"
                                            placeholder="First Name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                        <Input
                                            name="lastName"
                                            placeholder="Last Name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            disabled={loading}
                                        />
                                    </div>
                                )}

                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    icon={User}
                                />

                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
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

                                {isLogin && (
                                    <div className="text-right">
                                        <button
                                            type="button"
                                            onClick={() => setIsResetMode(true)}
                                            className="text-xs text-slate-500 hover:text-primary transition-colors"
                                        >
                                            Forgot your password?
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                isResetMode ? 'Reset Password' : isLogin ? 'Sign In' : 'Create Account'
                            )}
                        </Button>

                        {isResetMode && (
                            <button
                                type="button"
                                onClick={() => setIsResetMode(false)}
                                className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors mt-2"
                            >
                                Back to Login
                            </button>
                        )}
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

                    {!isResetMode && (
                        <div className={cn("text-center text-sm text-slate-400", showRecoveryModal && "opacity-20 pointer-events-none")}>
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={toggleMode}
                                className="text-primary hover:text-primary-light font-medium transition-colors"
                            >
                                {isLogin ? 'Sign up for free' : 'Log in'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Crisis Button */}
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

            {/* Recovery Code Modal */}
            {showRecoveryModal && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
                    <Card className="w-full max-w-md bg-slate-900 border-primary/30 shadow-2xl shadow-primary/20 overflow-hidden">
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                                <Shield className="text-primary" size={40} />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white">Save Your Security Code</h2>
                                <p className="text-slate-400 text-sm">
                                    If you ever forget your password, this unique code is the **only way** to regain access to your account.
                                </p>
                            </div>

                            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 relative group overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="text-3xl font-mono font-bold tracking-[0.3em] text-white relative z-10">
                                    {generatedCode}
                                </span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="primary"
                                    className="w-full h-12"
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedCode);
                                        setMessage({ text: 'Code copied! Please save it safely.', type: 'info' });
                                    }}
                                >
                                    Copy Code
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full h-12 text-slate-400 hover:text-white"
                                    onClick={() => {
                                        setShowRecoveryModal(false);
                                        navigate('/');
                                    }}
                                >
                                    I've saved it, let's go!
                                </Button>
                            </div>

                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                Warning: We cannot recover this code for you.
                            </p>
                        </div>
                    </Card>
                </div>
            )}

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
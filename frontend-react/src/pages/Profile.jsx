import React, { useState } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { User, Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import styles from '../styles/pages/Profile.module.css';
import { cn } from '../utils/utils';

const Profile = () => {
    const { user, changePassword, generateRecoveryCode, setUser } = useAuth();
    const [legacyCode, setLegacyCode] = useState('');
    const [showLegacyModal, setShowLegacyModal] = useState(false);

    // Form State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
        recovery: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false
    });
    const [useRecovery, setUseRecovery] = useState(false);

    // UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    if (!user) return null;

    const handleChange = (e) => {
        setPasswords(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (passwords.new !== passwords.confirm) {
            setMessage({ text: 'New passwords do not match', type: 'error' });
            return;
        }

        if (passwords.new.length < 8) {
            setMessage({ text: 'New password must be at least 8 characters long', type: 'error' });
            return;
        }

        setLoading(true);
        // Pass recovery code instead of current password if toggled
        const result = await changePassword(
            useRecovery ? null : passwords.current,
            passwords.new,
            useRecovery ? passwords.recovery : null
        );

        if (result.success) {
            setMessage({ text: 'Password updated successfully!', type: 'success' });
            setPasswords({ current: '', new: '', confirm: '', recovery: '' });
            setUseRecovery(false);
        } else {
            setMessage({ text: result.error, type: 'error' });
        }
        setLoading(false);
    };

    const handleGenerateCode = async () => {
        setLoading(true);
        const result = await generateRecoveryCode();
        if (result.success && result.data.recovery_code) {
            setLegacyCode(result.data.recovery_code);
            setShowLegacyModal(true);
            // Update local user state so the section disappears/updates
            setUser({ ...user, has_recovery_code: true });
        } else {
            setMessage({ text: result.error || 'Failed to generate code.', type: 'error' });
        }
        setLoading(false);
    };

    const isGoogleUser = user.provider === 'google';

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Your Profile</h1>
                <p className={styles.subtitle}>Manage your account settings and security</p>
            </div>

            <div className={styles.grid}>
                {/* Account Overview */}
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>
                        <User size={24} /> Account Overview
                    </h2>
                    <div className={styles.profileInfo}>
                        <div className={styles.avatarContainer}>
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt="Avatar" className={styles.avatar} />
                            ) : (
                                <span>{user.first_name?.[0]?.toUpperCase() || 'Y'}</span>
                            )}
                        </div>
                        <div className={styles.userDetails}>
                            <h3>{user.first_name} {user.last_name || ''}</h3>
                            <p>{user.email}</p>
                            <span className={cn(
                                styles.badge,
                                isGoogleUser ? styles.googleBadge : styles.localBadge
                            )}>
                                {user.provider} account
                            </span>
                        </div>
                    </div>

                    <div className={styles.securityNotice}>
                        <Shield className="text-indigo-400 mt-1" size={24} />
                        <div>
                            <p><b>Security Tip:</b> Your recovery code is your personal "safety net." If you ever lose access to your email or forget your password, it's the only way back in.</p>
                        </div>
                    </div>

                    {!user.has_recovery_code && !isGoogleUser && (
                        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-primary mt-1" size={20} />
                                <div>
                                    <h4 className="font-bold text-white">Action Required: Claim Security Code</h4>
                                    <p className="text-sm text-slate-400">Existing accounts must generate a unique recovery code to enable "Forgot Password" support.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleGenerateCode}
                                disabled={loading}
                                className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader className="animate-spin" size={18} /> : (
                                    <>
                                        <Shield size={18} /> Generate My Code (Once)
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Security Section */}
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>
                        <Shield size={24} /> Security
                    </h2>

                    {message.text && (
                        <div className={cn(styles.message, styles[message.type])}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {!isGoogleUser && (
                            <div className={styles.formGroup}>
                                <div className={styles.recoveryToggle}>
                                    <button
                                        type="button"
                                        className={styles.toggleLink}
                                        onClick={() => setUseRecovery(!useRecovery)}
                                    >
                                        {useRecovery ? "Use current password instead" : "Forgot current password? Use recovery code"}
                                    </button>
                                </div>
                                <label className={styles.label}>
                                    {useRecovery ? "Recovery Code" : "Current Password"}
                                </label>
                                <div className={styles.inputWrapper}>
                                    {useRecovery ? <Shield className={styles.inputIcon} size={18} /> : <Lock className={styles.inputIcon} size={18} />}
                                    <input
                                        type={(!useRecovery && !showPasswords.current) ? "password" : "text"}
                                        name={useRecovery ? "recovery" : "current"}
                                        value={useRecovery ? passwords.recovery : passwords.current}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder={useRecovery ? "10-Digit Code" : "••••••••"}
                                        required
                                    />
                                    {!useRecovery && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                            className="absolute right-4 text-gray-400 hover:text-white"
                                        >
                                            {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label className={styles.label}>New Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.inputIcon} size={18} />
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    name="new"
                                    value={passwords.new}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                    className="absolute right-4 text-gray-400 hover:text-white"
                                >
                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Confirm New Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock className={styles.inputIcon} size={18} />
                                <input
                                    type="password"
                                    name="confirm"
                                    value={passwords.confirm}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? <Loader className="animate-spin" size={18} /> : 'Update Password'}
                        </button>
                    </form>

                    {isGoogleUser && (
                        <p className="mt-4 text-sm text-gray-500 italic">
                            Tip: Since you signed in with Google, you can set a local password here to log in with your email directly next time.
                        </p>
                    )}
                </div>
            </div>

            {/* Legacy Recovery Modal */}
            {showLegacyModal && (
                <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fade-in text-center">
                    <div className="w-full max-w-md bg-slate-900 border border-primary/30 rounded-3xl p-8 space-y-6 shadow-2xl shadow-primary/20">
                        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                            <Shield className="text-primary" size={40} />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">Your Security Anchor</h2>
                            <p className="text-slate-400 text-sm">
                                This is your **one-time** recovery code. You will never see it here again. Please save it immediately!
                            </p>
                        </div>

                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                            <span className="text-3xl font-mono font-bold tracking-[0.3em] text-white">
                                {legacyCode}
                            </span>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(legacyCode);
                                    setMessage({ text: 'Code copied! Save it safely.', type: 'success' });
                                }}
                                className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all"
                            >
                                Copy to Clipboard
                            </button>
                            <button
                                onClick={() => setShowLegacyModal(false)}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all"
                            >
                                I've saved it securely
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;

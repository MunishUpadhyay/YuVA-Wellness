import React, { useState } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { User, Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import styles from '../styles/pages/Profile.module.css';
import { cn } from '../utils/utils';

const Profile = () => {
    const { user, changePassword } = useAuth();

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
                                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.current }))}
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
        </div>
    );
};

export default Profile;

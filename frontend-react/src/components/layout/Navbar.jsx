import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { Menu, X, Home, Heart, MessageCircle, Book, BarChart2, LayoutDashboard, LifeBuoy, LogOut, LogIn } from 'lucide-react';
import { cn } from '../../utils/utils';
import styles from '../../styles/components/Navbar.module.css';
import { Button } from '../ui/Button';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    const NavLink = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={cn(styles.navLink, isActive && styles.activeNavLink)}
            >
                <span className="flex items-center gap-2">
                    <Icon size={18} />
                    {label}
                </span>
            </Link>
        );
    };

    const MobileNavLink = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={cn(
                    "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    isActive
                        ? "bg-primary/10 text-primary"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
            >
                <Icon size={20} className="mr-3" />
                {label}
            </Link>
        );
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                {/* Logo */}
                <Link to="/" className={styles.logoArea}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-white font-bold text-lg">Y</span>
                    </div>
                    <span className={styles.logoText}>
                        YuVA Wellness
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className={styles.desktopNav}>
                    <NavLink to="/" icon={Home} label="Home" />
                    {user && (
                        <>
                            <NavLink to="/mood" icon={Heart} label="Mood" />
                            <NavLink to="/chat" icon={MessageCircle} label="Chat" />
                            <NavLink to="/journal" icon={Book} label="Journal" />
                            <NavLink to="/analytics" icon={BarChart2} label="Analytics" />
                            <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                        </>
                    )}
                    <NavLink to="/resources" icon={LifeBuoy} label="Resources" />

                    <div className="ml-4 pl-4 border-l border-white/10 flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden md:block text-right">
                                    <p className="text-sm font-medium text-white">{user.first_name || 'User'}</p>
                                    <p className="text-xs text-slate-400">Member</p>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                                    {(user.first_name || user.email || 'U').charAt(0).toUpperCase()}
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={logout}
                                    className="text-slate-400 hover:text-red-400"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </Button>
                            </div>
                        ) : (
                            <Link to="/login">
                                <Button variant="primary" size="sm">
                                    <LogIn size={18} className="mr-2" />
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-slate-300 hover:text-white focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    <MobileNavLink to="/" icon={Home} label="Home" />
                    {user && (
                        <>
                            <MobileNavLink to="/mood" icon={Heart} label="Mood" />
                            <MobileNavLink to="/chat" icon={MessageCircle} label="Chat" />
                            <MobileNavLink to="/journal" icon={Book} label="Journal" />
                            <MobileNavLink to="/analytics" icon={BarChart2} label="Analytics" />
                            <MobileNavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                        </>
                    )}
                    <MobileNavLink to="/resources" icon={LifeBuoy} label="Resources" />

                    <div className="border-t border-white/10 pt-4 mt-2">
                        {user ? (
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                            >
                                <LogOut size={20} className="mr-3" />
                                Logout
                            </Button>
                        ) : (
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="primary" className="w-full">
                                    <LogIn size={20} className="mr-2" />
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

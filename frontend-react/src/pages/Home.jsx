import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Heart, Book, MessageCircle, BarChart2, LayoutDashboard, LifeBuoy,
    ArrowRight, Shield, Lock, Activity, Brain, Smile, CheckCircle, Play, Sparkles, Wind
} from 'lucide-react';
import styles from '../styles/pages/Home.module.css';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { cn } from '../utils/utils';
import { motion } from 'framer-motion';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.page}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroBackground}>
                    <div className={cn(styles.heroBlob, styles.blob1)}></div>
                    <div className={cn(styles.heroBlob, styles.blob2)}></div>
                    <div className={cn(styles.heroBlob, styles.blob3)}></div>
                </div>

                <div className={styles.heroContent}>
                    <div className={styles.heroVisual}>
                        <div className={styles.visualCard}>
                            <div className="absolute inset-0 bg-gradient-glass opacity-50"></div>
                            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8 }}
                                    className="mb-8 relative w-64 h-64 flex items-center justify-center"
                                >
                                    {/* Main Gradient Circle */}
                                    <motion.div
                                        className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-emerald/20 to-primary/20 blur-xl"
                                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    />

                                    {/* Rotating Ring */}
                                    <motion.div
                                        className="absolute inset-0 rounded-full border border-white/10"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    >
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent-cyan rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                                    </motion.div>

                                    {/* Central Icon Composition */}
                                    <div className="relative z-10 w-40 h-40 bg-white/5 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-2xl">
                                        <motion.div
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <Brain size={80} className="text-accent-emerald drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                                        </motion.div>

                                        {/* Floating Particles */}
                                        <motion.div
                                            className="absolute -top-4 -right-4 text-accent-amber"
                                            animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                                        >
                                            <Sparkles size={24} />
                                        </motion.div>
                                        <motion.div
                                            className="absolute -bottom-2 -left-2 text-primary"
                                            animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                                        >
                                            <Wind size={24} />
                                        </motion.div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="grid grid-cols-3 gap-12 w-full max-w-2xl px-8"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-white/5 rounded-full"><Activity className="text-accent-cyan" /></div>
                                        <span className="text-sm font-medium text-slate-300">Track</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-white/5 rounded-full"><BarChart2 className="text-accent-violet" /></div>
                                        <span className="text-sm font-medium text-slate-300">Analyze</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-3 bg-white/5 rounded-full"><Smile className="text-accent-amber" /></div>
                                        <span className="text-sm font-medium text-slate-300">Thrive</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={styles.heroTitle}
                    >
                        <span className={styles.titleGradient}>YuVA Wellness</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className={styles.heroSubtitle}
                    >
                        Your personal AI companion for mental wellness. Track, analyze, and improve your mental health journey with intelligent insights and compassionate support.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className={styles.ctaGroup}
                    >
                        <Button
                            size="lg"
                            className="text-lg px-8 h-14 bg-gradient-to-r from-accent-emerald to-primary hover:opacity-90 border-0 shadow-lg shadow-primary/25"
                            onClick={() => navigate('/mood')}
                        >
                            <Heart className="mr-2 fill-current" /> Start Your Journey
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-lg px-8 h-14 border-white/10 hover:bg-white/5 text-white bg-slate-900/50 backdrop-blur-md"
                            onClick={() => navigate('/chat')}
                        >
                            <MessageCircle className="mr-2" /> Take Assessment
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
                className={styles.section}
            >
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className={styles.sectionTitle}>Comprehensive Support</h2>
                    <p className={styles.sectionDesc}>Discover powerful tools designed to support your mental wellness journey with AI-powered insights.</p>

                    <div className={styles.featureGrid}>
                        <FeatureCard
                            to="/mood"
                            icon={Heart}
                            color="text-accent-emerald"
                            bg="bg-accent-emerald/10"
                            title="Mood Tracking"
                            desc="Track your daily emotions with our intelligent mood assessment. Visualize patterns and trends."
                            action="Explore Tracking"
                        />
                        <FeatureCard
                            to="/journal"
                            icon={Book}
                            color="text-primary"
                            bg="bg-primary/10"
                            title="Smart Journaling"
                            desc="Express your thoughts and feelings through guided journaling with AI-powered insights."
                            action="Start Journaling"
                        />
                        <FeatureCard
                            to="/chat"
                            icon={MessageCircle}
                            color="text-accent-violet"
                            bg="bg-accent-violet/10"
                            title="AI Assessment"
                            desc="Engage in guided conversations with our AI to assess your mental wellness."
                            action="Chat Now"
                        />
                        <FeatureCard
                            to="/analytics"
                            icon={BarChart2}
                            color="text-accent-cyan"
                            bg="bg-accent-cyan/10"
                            title="Analytics"
                            desc="Discover meaningful patterns in your mental health data. Track progress and identify triggers."
                            action="View Data"
                        />
                        <FeatureCard
                            to="/dashboard"
                            icon={LayoutDashboard}
                            color="text-accent-amber"
                            bg="bg-accent-amber/10"
                            title="Dashboard"
                            desc="Access personalized insights, mindfulness sessions, and wellness recommendations."
                            action="Open Dashboard"
                        />
                        <FeatureCard
                            to="/resources"
                            icon={LifeBuoy}
                            color="text-red-400"
                            bg="bg-red-500/10"
                            title="Crisis Support"
                            desc="Access immediate help and crisis resources. Find professional support when you need it most."
                            action="Get Help"
                        />
                    </div>
                </div>
            </motion.section>

            {/* Journey Section */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
                className={cn(styles.section, "bg-surface/30")}
            >
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className={styles.sectionTitle}>Your Wellness Journey</h2>
                    <p className={styles.sectionDesc}>See how YuVA Wellness supports you through every step.</p>

                    <div className={styles.journeyGrid}>
                        <div className={styles.journeyLine}></div>
                        {[
                            { step: 1, title: 'Check In', desc: "Start by understanding how you're feeling today.", icon: Heart, color: 'text-accent-emerald' },
                            { step: 2, title: 'Reflect', desc: 'Express your thoughts in a safe space.', icon: Book, color: 'text-primary' },
                            { step: 3, title: 'Analyze', desc: 'Discover patterns and insights over time.', icon: BarChart2, color: 'text-accent-cyan' },
                            { step: 4, title: 'Grow', desc: 'Build healthy habits with mindfulness.', icon: Brain, color: 'text-accent-amber' }
                        ].map((item, index) => (
                            <div key={index} className="text-center group relative z-10">
                                <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-surface border-4 border-slate-800 shadow-xl transition-transform duration-300 group-hover:scale-110", item.color)}>
                                    <item.icon size={32} />
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold border-2 border-surface">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-slate-400 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Privacy Section */}
            <section className={styles.section}>
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="text-emerald-400" size={32} />
                    </div>
                    <h2 className={styles.sectionTitle}>Your Privacy Matters</h2>

                    <div className="grid md:grid-cols-2 gap-6 mt-12 text-left">
                        <Card className="bg-surface/50 border-white/5">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Lock className="text-emerald-400" />
                                    <h3 className="font-bold text-white">Local Storage</h3>
                                </div>
                                <p className="text-slate-400 text-sm">All your data is stored locally on your device. We don't collect or share your personal information.</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-surface/50 border-white/5">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle className="text-primary" />
                                    <h3 className="font-bold text-white">Safe Space</h3>
                                </div>
                                <p className="text-slate-400 text-sm">YuVA is a supportive tool designed to be a gentle companion on your journey.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-violet flex items-center justify-center text-white font-bold">Y</div>
                        <span className="text-xl font-bold text-white">YuVA Wellness</span>
                    </div>
                    <p className="text-slate-500 text-sm">© 2026 YuVA Wellness. Built with care for your wellbeing.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ to, icon: Icon, color, bg, title, desc, action }) => (
    <Link to={to} className="group">
        <Card className="h-full hover:bg-white/5 border-white/5 transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110", bg, color)}>
                    <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm mb-6">{desc}</p>
                <div className={cn("flex items-center text-sm font-medium transition-colors group-hover:text-white", color)}>
                    {action} <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                </div>
            </CardContent>
        </Card>
    </Link>
);

export default Home;

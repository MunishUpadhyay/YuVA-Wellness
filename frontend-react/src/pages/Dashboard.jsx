import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Brain, Lightbulb, Wind, PlayCircle, Heart, PenTool,
    BarChart2, Smile, Zap, Coffee, Moon, Sun,
    MessageCircle, Users, Check, X, Info, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import styles from '../styles/pages/Dashboard.module.css';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils/utils';
import { STORAGE_KEYS } from '../constants/storage';

const Dashboard = () => {
    const navigate = useNavigate();
    const [achievements, setAchievements] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [toast, setToast] = useState(null); // { message, type, action }
    const [metrics, setMetrics] = useState({
        avgMood: '--',
        streak: 0,
        journalCount: 0,
        wellnessScore: '--',
        wellnessCategory: 'Calculating...'
    });

    useEffect(() => {
        loadAchievements();
        calculateMetrics();
    }, []);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const calculateMetrics = () => {
        try {
            const moods = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOOD_ENTRIES) || '[]');
            const journals = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES) || '[]');

            // Re-using simplified logic for demo continuity
            const streak = calculateStreak(moods);

            let avgMood = '--';
            let wScore = '--';
            let wCat = 'Calculating...';

            if (moods.length > 0) {
                const totalScore = moods.reduce((sum, m) => sum + (m.score || 0), 0);
                avgMood = (totalScore / moods.length).toFixed(1);

                // Wellness Score
                wScore = Math.round((Number(avgMood) / 5) * 100);
                wCat = wScore >= 80 ? 'Excellent' : wScore >= 60 ? 'Good' : wScore >= 40 ? 'Fair' : 'Needs Attention';
            }

            setMetrics({
                avgMood,
                streak,
                journalCount: journals.length,
                wellnessScore: wScore,
                wellnessCategory: wCat
            });

        } catch (error) {
            console.error('Error calculating metrics', error);
        }
    };

    const loadAchievements = () => {
        try {
            const moods = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOOD_ENTRIES) || '[]');
            const mindfulnessSessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.MINDFULNESS_SESSIONS) || '[]');

            const newAchievements = [];

            if (mindfulnessSessions.length >= 10) {
                newAchievements.push({ icon: Brain, title: 'Mindfulness Master', desc: `${mindfulnessSessions.length} sessions completed!`, color: 'bg-accent-emerald', type: 'milestone' });
            } else if (mindfulnessSessions.length >= 5) {
                newAchievements.push({ icon: Wind, title: 'Mindful Practice', desc: `${mindfulnessSessions.length} sessions completed.`, color: 'bg-accent-teal', type: 'milestone' });
            } else if (mindfulnessSessions.length >= 1) {
                newAchievements.push({ icon: Zap, title: 'Mindful Beginning', desc: `First session completed!`, color: 'bg-accent-emerald', type: 'milestone' });
            }

            const streak = calculateStreak(moods);
            if (streak >= 7) {
                newAchievements.push({ icon: Zap, title: `${streak}-Day Streak`, desc: 'Consistent tracking!', color: 'bg-accent-amber', type: 'streak' });
            } else if (streak >= 1) {
                newAchievements.push({ icon: PlayCircle, title: 'Journey Started', desc: `${moods.length} moods tracked.`, color: 'bg-primary', type: 'milestone' });
            }

            if (newAchievements.length === 0) {
                newAchievements.push({ icon: PlayCircle, title: 'Start Journey', desc: 'Track your first mood.', color: 'bg-primary', type: 'next-step' });
                newAchievements.push({ icon: PenTool, title: 'Begin Reflecting', desc: 'Write your first journal.', color: 'bg-accent-violet', type: 'next-step' });
            }

            setAchievements(newAchievements);
        } catch (error) {
            console.error('Error loading achievements', error);
        }
    };

    const calculateStreak = (entries) => {
        if (!entries.length) return 0;
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sorted = [...entries].sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
        let lastDate = new Date(today);

        const hasToday = sorted.some(e => {
            const d = new Date(e.date || e.timestamp);
            return d.getFullYear() === today.getFullYear() &&
                d.getMonth() === today.getMonth() &&
                d.getDate() === today.getDate();
        });

        if (!hasToday) {
            lastDate.setDate(lastDate.getDate() - 1);
        }

        for (let i = 0; i < 30; i++) {
            const checkStr = lastDate.toISOString().split('T')[0];
            const hasEntry = sorted.some(e => (e.date || e.timestamp?.split('T')[0]) === checkStr);

            if (hasEntry) {
                streak++;
                lastDate.setDate(lastDate.getDate() - 1);
            } else {
                break;
            }
        }
        return streak;
    };

    const startSession = (type) => {
        const sessions = {
            breathing: {
                title: 'Breathing Exercise',
                desc: '4-7-8 breathing technique for deep relaxation',
                steps: [
                    'Find a comfortable position and close your eyes',
                    'Breathe in slowly through nose for 4 counts',
                    'Hold breath deeply for 7 counts',
                    'Exhale slowly through mouth for 8 counts',
                    'Repeat 4-8 times',
                    'Notice the relaxation'
                ]
            },
            meditation: {
                title: 'Guided Meditation',
                desc: 'Mindfulness for inner peace',
                steps: [
                    'Sit comfortably with straight back',
                    'Close eyes, take 3 deep breaths',
                    'Focus on your natural breath',
                    'Acknowledge thoughts without judgment',
                    'Return focus to breath gently',
                    'Be kind to yourself'
                ]
            },
            relaxation: {
                title: 'Progressive Relaxation',
                desc: 'Full body tension release',
                steps: [
                    'Lie down comfortably',
                    'Tense toes for 5s, then release',
                    'Move to calves, thighs, abdomen',
                    'Tense and release hands, arms, shoulders',
                    'Relax neck and face',
                    'Feel total relaxation'
                ]
            }
        };
        const session = sessions[type];
        if (session) setActiveSession({ ...session, type });
    };

    const completeSession = () => {
        if (!activeSession) return;
        const sessions = JSON.parse(localStorage.getItem(STORAGE_KEYS.MINDFULNESS_SESSIONS) || '[]');
        sessions.push({
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString(),
            completed: true,
            type: activeSession.type
        });
        localStorage.setItem(STORAGE_KEYS.MINDFULNESS_SESSIONS, JSON.stringify(sessions));

        setActiveSession(null);
        showToast('Session completed! Saved to achievements.', 'success');
        loadAchievements();
    };

    const addToRoutine = (name) => {
        const routines = JSON.parse(localStorage.getItem(STORAGE_KEYS.WELLNESS_ROUTINES) || '[]');
        if (!routines.some(r => r.name === name)) {
            routines.push({ name, date: new Date().toISOString() });
            localStorage.setItem(STORAGE_KEYS.WELLNESS_ROUTINES, JSON.stringify(routines));
            showToast(`Added "${name}" to routine!`, 'success');
        } else {
            showToast(`"${name}" is already in routine.`, 'info');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <section className={styles.header}>
                <div className={styles.headerContent}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-8 relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center mx-auto"
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
                        <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 bg-white/5 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center shadow-2xl">
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Brain size={64} className="text-accent-emerald drop-shadow-[0_0_15px_rgba(52,211,153,0.5)] md:w-20 md:h-20" />
                            </motion.div>

                            {/* Floating Particles */}
                            <motion.div
                                className="absolute -top-2 -right-2 text-accent-amber"
                                animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                            >
                                <Sparkles size={20} />
                            </motion.div>
                            <motion.div
                                className="absolute -bottom-2 -left-2 text-primary"
                                animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                            >
                                <Wind size={20} />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className={styles.headerTitle}
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent-emerald via-teal-400 to-accent-violet">AI Wellness Dashboard</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className={styles.headerSubtitle}
                    >
                        A calm place to understand yourself and gently move forward.
                    </motion.p>
                </div>
            </section>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* 1. Daily Personalized Insight */}
                <motion.section variants={itemVariants} className={styles.section}>
                    <div className={styles.container}>
                        <Card variant="glass" className="border-accent-emerald/20 bg-accent-emerald/5 max-w-4xl mx-auto">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto w-12 h-12 bg-accent-emerald/20 rounded-full flex items-center justify-center mb-2">
                                    <Lightbulb size={24} className="text-accent-emerald" />
                                </div>
                                <CardTitle>Today's Wellness Insight</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-surface/50 p-6 rounded-xl border border-white/5 text-center">
                                    <p className="text-lg text-slate-200">
                                        Your mood patterns show gentle consistency this week. This suggests you're finding a rhythm that works for you.
                                    </p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-primary/10 p-4 rounded-lg flex items-center justify-center gap-3 border border-primary/20 text-primary-foreground">
                                        <Wind size={20} className="text-primary" />
                                        <span>Try a breathing exercise today</span>
                                    </div>
                                    <div className="bg-accent-amber/10 p-4 rounded-lg flex items-center justify-center gap-3 border border-accent-amber/20 text-accent-amber">
                                        <Zap size={20} />
                                        <span>5-day tracking streak!</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.section>

                {/* 2. Mindfulness Sessions */}
                <motion.section variants={itemVariants} className={cn(styles.section, "bg-surface/30")}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Mindfulness Sessions</h2>
                            <p className={styles.sectionDesc}>Gentle practices for immediate self-care</p>
                        </div>

                        <div className={cn(styles.gridContainer, styles.grid4)}>
                            <Card
                                className={cn(styles.sessionCard, "group hover:border-accent-cyan/50")}
                                onClick={() => startSession('breathing')}
                            >
                                <CardContent className="text-center pt-6">
                                    <div className={cn(styles.iconWrapper, "bg-accent-cyan/10 group-hover:bg-accent-cyan/20 group-hover:scale-110")}>
                                        <Wind size={24} className="text-accent-cyan" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-1">Breathing</h3>
                                    <p className="text-sm text-slate-400 mb-4">4-7-8 Technique</p>
                                    <Badge variant="outline" className="mb-4 text-accent-cyan border-accent-cyan/20">5 min</Badge>
                                    <Button variant="outline" className="w-full border-accent-cyan/20 hover:bg-accent-cyan/10 text-accent-cyan">Start</Button>
                                </CardContent>
                            </Card>

                            <Card
                                className={cn(styles.sessionCard, "group hover:border-accent-violet/50")}
                                onClick={() => startSession('meditation')}
                            >
                                <CardContent className="text-center pt-6">
                                    <div className={cn(styles.iconWrapper, "bg-accent-violet/10 group-hover:bg-accent-violet/20 group-hover:scale-110")}>
                                        <Brain size={24} className="text-accent-violet" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-1">Meditation</h3>
                                    <p className="text-sm text-slate-400 mb-4">Inner Peace</p>
                                    <Badge variant="outline" className="mb-4 text-accent-violet border-accent-violet/20">10 min</Badge>
                                    <Button variant="outline" className="w-full border-accent-violet/20 hover:bg-accent-violet/10 text-accent-violet">Start</Button>
                                </CardContent>
                            </Card>

                            <Card
                                className={cn(styles.sessionCard, "group hover:border-accent-amber/50")}
                                onClick={() => startSession('relaxation')}
                            >
                                <CardContent className="text-center pt-6">
                                    <div className={cn(styles.iconWrapper, "bg-accent-amber/10 group-hover:bg-accent-amber/20 group-hover:scale-110")}>
                                        <Coffee size={24} className="text-accent-amber" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-1">Relaxation</h3>
                                    <p className="text-sm text-slate-400 mb-4">Body Scan</p>
                                    <Badge variant="outline" className="mb-4 text-accent-amber border-accent-amber/20">15 min</Badge>
                                    <Button variant="outline" className="w-full border-accent-amber/20 hover:bg-accent-amber/10 text-accent-amber">Start</Button>
                                </CardContent>
                            </Card>

                            <Card
                                className={cn(styles.sessionCard, "group hover:border-secondary/50")}
                                onClick={() => startSession('gratitude')}
                            >
                                <CardContent className="text-center pt-6">
                                    <div className={cn(styles.iconWrapper, "bg-secondary/10 group-hover:bg-secondary/20 group-hover:scale-110")}>
                                        <Heart size={24} className="text-secondary" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-1">Gratitude</h3>
                                    <p className="text-sm text-slate-400 mb-4">Appreciation</p>
                                    <Badge variant="outline" className="mb-4 text-secondary border-secondary/20">7 min</Badge>
                                    <Button variant="outline" className="w-full border-secondary/20 hover:bg-secondary/10 text-secondary">Start</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </motion.section>

                {/* 3. Progress Overview */}
                <motion.section variants={itemVariants} className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Progress Overview</h2>
                            <p className={styles.sectionDesc}>Your wellness journey at a glance</p>
                        </div>

                        <div className={cn(styles.gridContainer, styles.grid2)}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>This Week's Growth</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={styles.progressItem}>
                                        <div className={styles.progressLabel}>
                                            <span className="flex items-center gap-2 text-slate-300"><Smile size={18} className="text-accent-emerald" /> Mood Stability</span>
                                            <span className="text-accent-emerald">Good</span>
                                        </div>
                                        <motion.div
                                            className={styles.progressBar}
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                        >
                                            <motion.div
                                                className={cn(styles.progressFill, "bg-accent-emerald")}
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "75%" }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                viewport={{ once: true }}
                                            ></motion.div>
                                        </motion.div>
                                    </div>
                                    <div className={styles.progressItem}>
                                        <div className={styles.progressLabel}>
                                            <span className="flex items-center gap-2 text-slate-300"><PenTool size={18} className="text-primary" /> Journaling</span>
                                            <span className="text-primary">Regular</span>
                                        </div>
                                        <motion.div
                                            className={styles.progressBar}
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                        >
                                            <motion.div
                                                className={cn(styles.progressFill, "bg-primary")}
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "60%" }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                                viewport={{ once: true }}
                                            ></motion.div>
                                        </motion.div>
                                    </div>
                                    <div className={styles.progressItem}>
                                        <div className={styles.progressLabel}>
                                            <span className="flex items-center gap-2 text-slate-300"><Wind size={18} className="text-accent-cyan" /> Mindfulness</span>
                                            <span className="text-accent-cyan">Growing</span>
                                        </div>
                                        <motion.div
                                            className={styles.progressBar}
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            viewport={{ once: true }}
                                        >
                                            <motion.div
                                                className={cn(styles.progressFill, "bg-accent-cyan")}
                                                initial={{ width: 0 }}
                                                whileInView={{ width: "50%" }}
                                                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                                                viewport={{ once: true }}
                                            ></motion.div>
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Wellness Score</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center py-8">
                                    <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-slate-800" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"></path>
                                            <motion.path
                                                className="text-primary drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                fill="none"
                                                strokeDasharray={`${metrics.wellnessScore}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                initial={{ pathLength: 0 }}
                                                whileInView={{ pathLength: 1 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                viewport={{ once: true }}
                                            ></motion.path>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.5, duration: 0.5 }}
                                                viewport={{ once: true }}
                                                className="text-3xl font-bold text-white"
                                            >
                                                {metrics.wellnessScore}
                                            </motion.span>
                                            <span className="text-xs text-slate-400">/ 100</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-300 mb-1">{metrics.wellnessCategory}</p>
                                    <p className="text-sm text-slate-500">Based on your recent activity</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </motion.section>

                {/* 4. Achievements */}
                <motion.section variants={itemVariants} className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Achievements</h2>
                            <p className={styles.sectionDesc}>Celebrating your milestones</p>
                        </div>

                        <div className={cn(styles.gridContainer, styles.grid3)}>
                            {achievements.length > 0 ? achievements.map((ach, i) => (
                                <Card key={i} className="hover:bg-slate-800/50 transition-colors">
                                    <CardContent className="text-center pt-6">
                                        <div className={cn("w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg", ach.color)}>
                                            <ach.icon size={24} />
                                        </div>
                                        <h3 className="font-semibold text-white mb-2">{ach.title}</h3>
                                        <CardDescription>{ach.desc}</CardDescription>
                                        <Badge variant="secondary" className="mt-4 bg-slate-800 text-slate-300">
                                            {ach.type === 'streak' ? '🔥 Streak' :
                                                ach.type === 'milestone' ? '🏆 Milestone' :
                                                    ach.type === 'next-step' ? '➡️ Next Step' : '⭐ Welcome'}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            )) : (
                                <div className="col-span-3 text-center text-slate-500 italic">No achievements yet. Start your journey!</div>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* 5. Wellness Sessions & Events (Routine) */}
                <motion.section variants={itemVariants} className={cn(styles.section, "bg-surface/30")}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Daily Routine</h2>
                            <p className={styles.sectionDesc}>Simple habits to anchor your day</p>
                        </div>

                        <div className={cn(styles.gridContainer, styles.grid3)}>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-accent-amber/10 rounded-lg"><Sun size={20} className="text-accent-amber" /></div>
                                        <div>
                                            <CardTitle className="text-lg">Morning</CardTitle>
                                            <CardDescription>Daily • 8:00 AM</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-400 mb-4">Start your day with intention setting.</p>
                                    <Button variant="ghost" className="w-full justify-start text-accent-amber hover:text-accent-amber hover:bg-accent-amber/10" onClick={() => addToRoutine('Morning Motivation')}>
                                        <Check size={16} className="mr-2" /> Add to Routine
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg"><Coffee size={20} className="text-primary" /></div>
                                        <div>
                                            <CardTitle className="text-lg">Midday</CardTitle>
                                            <CardDescription>Daily • 12:30 PM</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-400 mb-4">A gentle pause to reset your energy.</p>
                                    <Button variant="ghost" className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10" onClick={() => addToRoutine('Midday Mindfulness')}>
                                        <Check size={16} className="mr-2" /> Add to Routine
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-accent-violet/10 rounded-lg"><Moon size={20} className="text-accent-violet" /></div>
                                        <div>
                                            <CardTitle className="text-lg">Evening</CardTitle>
                                            <CardDescription>Daily • 7:00 PM</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-400 mb-4">Reflection and gratitude.</p>
                                    <Button variant="ghost" className="w-full justify-start text-accent-violet hover:text-accent-violet hover:bg-accent-violet/10" onClick={() => addToRoutine('Evening Reflection')}>
                                        <Check size={16} className="mr-2" /> Add to Routine
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </motion.section>
            </motion.div>

            {/* Chat Callout */}
            <section className={styles.section}>
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <Button
                        size="lg"
                        className="rounded-full shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-accent-violet border-0 h-14 px-8 text-lg"
                        onClick={() => navigate('/chat')}
                    >
                        <MessageCircle className="mr-3" />
                        Need to talk? Open Chat
                    </Button>
                </div>
            </section>

            {/* Modal */}
            {activeSession && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-heading text-white">{activeSession.title}</h3>
                            <button onClick={() => setActiveSession(null)} className="text-slate-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-slate-300 mb-6">{activeSession.desc}</p>
                        <div className="space-y-4 mb-8">
                            {activeSession.steps.map((step, i) => (
                                <div key={i} className={styles.stepItem}>
                                    <span className={styles.stepNumber}>
                                        {i + 1}
                                    </span>
                                    <p className="text-slate-300">{step}</p>
                                </div>
                            ))}
                        </div>
                        <div className="text-center">
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full md:w-auto"
                                size="lg"
                                onClick={completeSession}
                            >
                                <Check size={20} className="mr-2" />
                                Complete Session
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className={cn(styles.toast, toast.type === 'success' ? 'bg-emerald-600' : 'bg-blue-600')}>
                    <Info size={20} />
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

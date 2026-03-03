import React, { useState, useEffect, useMemo } from 'react';
import {
    Heart, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight,
    Battery, BatteryMedium, BatteryFull, Moon, CloudMoon, Sun, Star,
    Users, User, Activity, Zap, CheckCircle, AlertCircle, Lightbulb, Sparkles
} from 'lucide-react';
import ApiClient from '../../services/apiClient';
import { API_ENDPOINTS } from '../../constants/api';
import styles from '../../styles/pages/Mood.module.css';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/utils';
import PageHeader from '../../components/layout/PageHeader';
import GlassCard from '../../components/ui/GlassCard';

const Mood = () => {
    const [step, setStep] = useState(1);
    const [moodData, setMoodData] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
    const [historyFilter, setHistoryFilter] = useState('week'); // 'week' | 'month'
    const [tooltipData, setTooltipData] = useState(null);

    const [assessment, setAssessment] = useState({
        mood: null,
        intensity: null,
        energy: null,
        stress: null,
        sleep: null,
        social: null,
        motivation: null,
        note: ''
    });

    useEffect(() => {
        loadMoods();
    }, []);

    const loadMoods = async () => {
        setLoading(true);
        try {
            const result = await ApiClient.get(API_ENDPOINTS.MOODS.LIST);
            if (result.success && result.data) {
                const dataMap = {};
                result.data.forEach(mood => {
                    dataMap[mood.logged_date] = mood;
                });
                setMoodData(dataMap);
            }
        } catch (error) {
            console.error('Failed to load moods', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelection = (field, value) => {
        setAssessment(prev => ({ ...prev, [field]: value }));
        setTimeout(() => {
            setStep(prev => prev + 1);
        }, 300);
    };

    const handleSubmit = async () => {
        setLoading(true);

        const moodScores = {
            'very_sad': 1, 'sad': 2, 'neutral': 3, 'happy': 4, 'very_happy': 5
        };
        const score = moodScores[assessment.mood] || 3;

        try {
            const result = await ApiClient.post(API_ENDPOINTS.MOODS.BASE, {
                ...assessment,
                score,
                logged_date: new Date().toISOString().split('T')[0]
            });

            if (result.success) {
                setSubmitStatus('success');
                loadMoods();
                setTimeout(() => resetAssessment(), 3000);
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const resetAssessment = () => {
        setAssessment({
            mood: null, intensity: null, energy: null, stress: null, sleep: null, social: null, motivation: null, note: ''
        });
        setStep(1);
        setSubmitStatus(null);
    };

    // Calendar & Tooltip Logic
    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

    const handleMouseEnter = (e, dateStr, entry) => {
        const rect = e.target.getBoundingClientRect();
        const date = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        // Tooltip content logic (simplified for brevity)
        const content = entry ? (
            <>
                <div className="font-medium mb-1">{date}</div>
                <div className="text-primary-300 mb-1 capitalize">{entry.mood?.replace('_', ' ')}</div>
            </>
        ) : (
            <>
                <div className="font-medium mb-1">{date}</div>
                <div className="text-slate-400 text-xs">No entry</div>
            </>
        );

        setTooltipData({ x: rect.left + rect.width / 2, y: rect.top - 10, content });
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className={styles.dayCellEmpty}></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const entry = moodData[dateStr];
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            let bgClass = 'bg-slate-800/30 text-slate-500 hover:bg-slate-800 border border-white/5';
            if (entry) {
                const score = Math.round(entry.score);
                if (score <= 1) bgClass = 'bg-accent-violet/30 text-white border-accent-violet/30';
                else if (score <= 2) bgClass = 'bg-accent-violet/50 text-white border-accent-violet/50';
                else if (score <= 3) bgClass = 'bg-accent-cyan/50 text-white border-accent-cyan/50';
                else if (score <= 4) bgClass = 'bg-accent-cyan/70 text-white border-accent-cyan/70';
                else bgClass = 'bg-accent-emerald/70 text-white border-accent-emerald/70';
            }
            if (isToday) bgClass += ' ring-2 ring-primary';

            days.push(
                <div
                    key={day}
                    className={cn(styles.dayCell, bgClass)}
                    onClick={() => { if (entry) { setSelectedEntry(entry); setIsDetailsModalOpen(true); } }}
                    onMouseEnter={(e) => handleMouseEnter(e, dateStr, entry)}
                    onMouseLeave={() => setTooltipData(null)}
                >
                    {day}
                </div>
            );
        }
        return days;
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const wellnessInsight = useMemo(() => {
        const insights = [
            "Your wellness journey shows natural rhythms - some days for growth, others for rest.",
            "The gentle patterns in your calendar reflect the beautiful complexity of being human.",
            "Each day you check in with yourself is a small act of self-compassion.",
            "Your calendar shows both quiet moments and brighter days - this balance is part of healing."
        ];
        return insights[Math.floor(Math.random() * insights.length)];
    }, []);

    const filteredHistory = useMemo(() => {
        const now = new Date();
        return Object.values(moodData)
            .filter(entry => {
                const entryTime = new Date(entry.logged_date);
                if (historyFilter === 'week') {
                    return entryTime >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                }
                return entryTime >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            })
            .sort((a, b) => new Date(b.logged_date) - new Date(a.logged_date));
    }, [moodData, historyFilter]);

    return (
        <div className={styles.page}>
            <PageHeader
                title="Mental Wellness Assessment"
                subtitle="Check-in with yourself. Track your journey to balance."
                icon={Heart}
                color="text-accent-rose"
                orbitColor="border-accent-rose/30"
            />

            <section className={styles.container}>
                <GlassCard className="max-w-2xl mx-auto min-h-[500px] flex flex-col relative overflow-hidden">
                    {step > 1 && (
                        <button onClick={() => setStep(prev => prev - 1)} className={styles.backBtn}>
                            <ArrowLeft size={24} />
                        </button>
                    )}

                    <div className={styles.progressBar}>
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                            <div key={i} className={cn(styles.progressDot, i <= step ? styles.progressDotActive : styles.progressDotInactive)}></div>
                        ))}
                    </div>
                    <p className="text-center text-sm text-slate-500 mb-8">Question {step <= 7 ? step : 7} of 7</p>

                    {step === 1 && (
                        <div className="animate-fade-in flex-1 flex flex-col justify-center">

                            <h3 className={styles.questionTitle}>What emotion best describes your current state?</h3>
                            <div className={cn(styles.optionGrid, styles.grid5)}>
                                <MoodOption emoji="😢" label="Very Sad" desc="Deep sadness" onClick={() => handleSelection('mood', 'very_sad')} />
                                <MoodOption emoji="😔" label="Sad" desc="Feeling down" onClick={() => handleSelection('mood', 'sad')} />
                                <MoodOption emoji="😐" label="Neutral" desc="Okay" onClick={() => handleSelection('mood', 'neutral')} />
                                <MoodOption emoji="😊" label="Happy" desc="Good" onClick={() => handleSelection('mood', 'happy')} />
                                <MoodOption emoji="😄" label="Joyful" desc="Great" onClick={() => handleSelection('mood', 'very_happy')} />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            <h3 className={styles.questionTitle}>How intense are your emotions right now?</h3>
                            <div className={cn(styles.optionGrid, "max-w-xl mx-auto")}>
                                <ListOption label="Low Intensity" desc="Muted or distant" color="bg-accent-cyan/30" onClick={() => handleSelection('intensity', 'low')} />
                                <ListOption label="Moderate Intensity" desc="Present and noticeable" color="bg-accent-cyan/60" onClick={() => handleSelection('intensity', 'moderate')} />
                                <ListOption label="High Intensity" desc="Strong and overwhelming" color="bg-accent-cyan" onClick={() => handleSelection('intensity', 'high')} />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fade-in">
                            <h3 className={styles.questionTitle}>How is your physical energy today?</h3>
                            <div className={cn(styles.optionGrid, styles.grid3)}>
                                <CardOption icon={Battery} label="Low" desc="Drained" color="text-accent-violet" onClick={() => handleSelection('energy', 'low')} />
                                <CardOption icon={BatteryMedium} label="Moderate" desc="Balanced" color="text-primary" onClick={() => handleSelection('energy', 'moderate')} />
                                <CardOption icon={BatteryFull} label="High" desc="Energetic" color="text-accent-emerald" onClick={() => handleSelection('energy', 'high')} />
                            </div>
                        </div>
                    )}

                    {/* Additional steps 4-7 follow similar patterns, abbreviated for brevity but keeping structure */}
                    {step === 4 && (
                        <div className="animate-fade-in">
                            <h3 className={styles.questionTitle}>How tense or stressed do you feel?</h3>
                            <div className={cn(styles.optionGrid, "max-w-xl mx-auto")}>
                                <ListOption label="Calm" desc="Relaxed" color="bg-accent-emerald" onClick={() => handleSelection('stress', 'low')} />
                                <ListOption label="Manageable" desc="Coping okay" color="bg-primary" onClick={() => handleSelection('stress', 'moderate')} />
                                <ListOption label="Overwhelmed" desc="Hard to manage" color="bg-accent-amber" onClick={() => handleSelection('stress', 'high')} />
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="animate-fade-in">
                            <h3 className={styles.questionTitle}>How did you sleep last night?</h3>
                            <div className={cn(styles.optionGrid, "grid-cols-2 max-w-2xl mx-auto")}>
                                <CardOption icon={Moon} label="Poor" desc="Restless" color="text-accent-amber" onClick={() => handleSelection('sleep', 'poor')} />
                                <CardOption icon={CloudMoon} label="Fair" desc="Okay" color="text-primary" onClick={() => handleSelection('sleep', 'fair')} />
                                <CardOption icon={Star} label="Good" desc="Restful" color="text-accent-cyan" onClick={() => handleSelection('sleep', 'good')} />
                                <CardOption icon={Sun} label="Great" desc="Refreshing" color="text-accent-emerald" onClick={() => handleSelection('sleep', 'excellent')} />
                            </div>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="animate-fade-in">
                            <h3 className={styles.questionTitle}>Have you interacted or connected with anyone today?</h3>
                            <div className={cn(styles.optionGrid, "max-w-xl mx-auto")}>
                                <ListOption label="Isolated" desc="Disconnected" color="bg-accent-violet" onClick={() => handleSelection('social', 'isolated')} />
                                <ListOption label="Connected" desc="Meaningful interactions" color="bg-primary" onClick={() => handleSelection('social', 'somewhat_connected')} />
                                <ListOption label="Supported" desc="Well supported" color="bg-accent-emerald" onClick={() => handleSelection('social', 'well_connected')} />
                            </div>
                        </div>
                    )}

                    {step === 7 && (
                        <div className="animate-fade-in">
                            <h3 className={styles.questionTitle}>Do you feel motivated to tackle the day?</h3>
                            <div className={cn(styles.optionGrid, "max-w-xl mx-auto")}>
                                <ListOption label="Low" desc="Struggling" color="bg-accent-violet" onClick={() => handleSelection('motivation', 'low')} />
                                <ListOption label="Moderate" desc="Steady" color="bg-primary" onClick={() => handleSelection('motivation', 'moderate')} />
                                <ListOption label="High" desc="Driven" color="bg-accent-emerald" onClick={() => handleSelection('motivation', 'high')} />
                            </div>
                        </div>
                    )}

                    {step === 8 && (
                        <div className="animate-fade-in max-w-xl mx-auto text-center">
                            <h3 className="text-xl font-semibold mb-4 text-white">Quick notes for today?</h3>
                            <textarea
                                className={styles.textArea}
                                placeholder="Share your thoughts..."
                                value={assessment.note}
                                onChange={(e) => setAssessment({ ...assessment, note: e.target.value })}
                            ></textarea>

                            {!submitStatus ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full h-14 text-lg bg-primary hover:bg-primary-600 shadow-lg shadow-primary/25 border-0"
                                >
                                    {loading ? 'Saving...' : 'Record Assessment'}
                                </Button>
                            ) : submitStatus === 'success' ? (
                                <div className="bg-emerald-500/10 p-6 rounded-xl border border-emerald-500/20">
                                    <CheckCircle className="mx-auto text-emerald-400 mb-2" size={40} />
                                    <h3 className="text-xl font-bold text-white">Saved Successfully!</h3>
                                </div>
                            ) : (
                                <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/20">
                                    <AlertCircle className="mx-auto text-red-400 mb-2" size={40} />
                                    <h3 className="text-xl font-bold text-white">Error Saving</h3>
                                    <Button onClick={() => setSubmitStatus(null)} variant="outline" className="mt-4">Retry</Button>
                                </div>
                            )}
                        </div>
                    )}
                </GlassCard>
            </section>

            <section className={styles.calendarSection}>
                <div className={styles.container}>
                    <h2 className="text-3xl font-bold text-center mb-8 text-white">Your Wellness Calendar</h2>
                    <div className={styles.calendarCard}>
                        <div className={styles.calendarHeader}>
                            <button onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)} className={styles.navBtn}><ChevronLeft /></button>
                            <h3 className={styles.monthTitle}>{monthNames[currentMonth]} {currentYear}</h3>
                            <button onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)} className={styles.navBtn}><ChevronRight /></button>
                        </div>
                        <div className={styles.weekGrid}>
                            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                        </div>
                        <div className={styles.daysGrid}>
                            {renderCalendarDays()}
                        </div>
                        {tooltipData && (
                            <div
                                className="fixed bg-slate-800 text-white text-xs rounded-lg px-3 py-2 border border-white/10 shadow-xl z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
                                style={{ left: tooltipData.x, top: tooltipData.y }}
                            >
                                {tooltipData.content}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className={styles.historySection}>
                <div className={styles.container}>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-4">Recent Reflections</h2>
                        <div className={styles.historyFilter}>
                            <button onClick={() => setHistoryFilter('week')} className={cn(styles.filterBtn, historyFilter === 'week' ? styles.filterActive : styles.filterInactive)}>Past Week</button>
                            <button onClick={() => setHistoryFilter('month')} className={cn(styles.filterBtn, historyFilter === 'month' ? styles.filterActive : styles.filterInactive)}>Past Month</button>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-3xl mx-auto">
                        {filteredHistory.map(entry => (
                            <div
                                key={entry.id || entry.logged_date}
                                className={`${styles.historyCard} group`}
                                onClick={() => { setSelectedEntry(entry); setIsDetailsModalOpen(true); }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-3 h-3 rounded-full shrink-0",
                                        entry.score <= 2 ? 'bg-accent-violet' : entry.score <= 3 ? 'bg-accent-cyan' : 'bg-accent-emerald'
                                    )}></div>
                                    <div className="text-2xl">
                                        {entry.mood === 'very_sad' ? '😢' : entry.mood === 'sad' ? '😔' : entry.mood === 'neutral' ? '😐' : entry.mood === 'happy' ? '😊' : '😄'}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white capitalize">{entry.mood?.replace('_', ' ')}</div>
                                        <div className="text-sm text-slate-400">{new Date(entry.logged_date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <ArrowRight size={18} className="text-slate-500 group-hover:text-white" />
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 max-w-2xl mx-auto">
                        <div className="bg-gradient-to-r from-primary/10 to-accent-violet/10 rounded-xl p-6 border border-white/5 flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <Lightbulb className="text-primary" size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm mb-1">Gentle Insight</h4>
                                <p className="text-slate-300 text-sm leading-relaxed">{wellnessInsight}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const MoodOption = ({ emoji, label, desc, onClick }) => (
    <button onClick={onClick} className={styles.moodOption}>
        <div className={styles.moodEmoji}>{emoji}</div>
        <div className={styles.moodLabel}>{label}</div>
        <div className={styles.moodDesc}>{desc}</div>
    </button>
);

const ListOption = ({ label, desc, color, onClick }) => (
    <button onClick={onClick} className={styles.listOption}>
        <div className={cn("w-6 h-6 rounded-full shrink-0", color)}></div>
        <div>
            <div className="font-medium text-white">{label}</div>
            <div className="text-sm text-slate-400">{desc}</div>
        </div>
    </button>
);

const CardOption = ({ icon: Icon, label, desc, color, onClick }) => (
    <button onClick={onClick} className={styles.cardOption}>
        <Icon className={cn("mb-4 transition-transform group-hover:scale-110", color)} size={32} />
        <div className="font-medium text-white mb-1">{label}</div>
        <div className="text-sm text-slate-400">{desc}</div>
    </button>
);

export default Mood;

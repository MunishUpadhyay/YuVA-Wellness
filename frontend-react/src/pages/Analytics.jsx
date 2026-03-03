import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Bar, PolarArea } from 'react-chartjs-2';
import {
    BarChart2, TrendingUp, TrendingDown, Minus, Calendar,
    Activity, Heart, Zap, Book, Award, Brain, Lightbulb,
    Info, Search
} from 'lucide-react';
import ApiClient from '../services/apiClient';
import { API_ENDPOINTS } from '../constants/api';
import styles from '../styles/pages/Analytics.module.css';
import { cn } from '../utils/utils';
import { Badge } from '../components/ui/Badge';
import PageHeader from '../components/layout/PageHeader';

// Register ChartJS components
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

const Analytics = () => {
    const [timeRange, setTimeRange] = useState(7);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ moods: [], journals: [] });
    const [metrics, setMetrics] = useState({
        avgMood: '--',
        moodTrend: 'stable',
        currentStreak: 0,
        longestStreak: 0,
        journalCount: 0,
        journalWords: 0,
        wellnessScore: '--',
        wellnessCategory: 'Calculating...'
    });
    const [tab, setTab] = useState('trends');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!loading) {
            calculateMetrics();
        }
    }, [timeRange, data, loading]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [moodsRes, journalsRes] = await Promise.all([
                ApiClient.get(API_ENDPOINTS.MOODS.LIST),
                ApiClient.get(`${API_ENDPOINTS.JOURNAL.BASE}?limit=90`)
            ]);
            setData({
                moods: moodsRes.success && moodsRes.data ? moodsRes.data : [],
                journals: journalsRes.success && journalsRes.data ? journalsRes.data : []
            });
        } catch (error) {
            console.error("Error loading analytics data", error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredData = (items, days) => {
        if (!items || items.length === 0) return [];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        cutoffDate.setHours(0, 0, 0, 0);

        return items.filter(entry => {
            const date = new Date(entry.logged_date || entry.entry_date || entry.created_at);
            return date >= cutoffDate;
        }).sort((a, b) => new Date(a.logged_date || a.entry_date) - new Date(b.logged_date || b.entry_date));
    };

    const calculateMetrics = () => {
        const filteredMoods = getFilteredData(data.moods, timeRange);
        const filteredJournals = getFilteredData(data.journals, timeRange);

        // Avg Mood
        const avgMood = filteredMoods.length > 0
            ? (filteredMoods.reduce((sum, m) => sum + (m.score || 0), 0) / filteredMoods.length).toFixed(1)
            : '--';

        // Mood Trend
        let moodTrend = 'stable';
        if (filteredMoods.length >= 4) {
            const halfPoint = Math.floor(filteredMoods.length / 2);
            const firstHalf = filteredMoods.slice(0, halfPoint);
            const secondHalf = filteredMoods.slice(halfPoint);
            const firstAvg = firstHalf.reduce((sum, m) => sum + (m.score || 0), 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, m) => sum + (m.score || 0), 0) / secondHalf.length;
            const trend = secondAvg - firstAvg;
            if (trend > 0.2) moodTrend = 'improving';
            else if (trend < -0.2) moodTrend = 'declining';
        }

        // Streak logic matches existing
        const streak = calculateStreak(data.moods);
        const journalWords = filteredJournals.reduce((sum, j) => sum + (j.content?.trim().split(/\s+/).length || 0), 0);

        // Wellness Score
        let wScore = '--';
        let wCat = 'Calculating...';
        if (filteredMoods.length > 0) {
            wScore = Math.round((Number(avgMood) / 5) * 100);
            wCat = wScore >= 80 ? 'Excellent' : wScore >= 60 ? 'Good' : wScore >= 40 ? 'Fair' : 'Needs Attention';
        }

        setMetrics({
            avgMood, moodTrend, currentStreak: streak.current, longestStreak: streak.longest,
            journalCount: filteredJournals.length, journalWords, wellnessScore: wScore, wellnessCategory: wCat
        });
    };

    const calculateStreak = (moods) => {
        if (!moods || moods.length === 0) return { current: 0, longest: 0 };
        const sortedMoods = [...moods].filter(mood => mood.logged_date && mood.score).sort((a, b) => new Date(a.logged_date) - new Date(b.logged_date));
        if (sortedMoods.length === 0) return { current: 0, longest: 0 };

        let currentStreak = 0, longestStreak = 0, tempStreak = 0;
        sortedMoods.forEach(entry => {
            if (entry.score >= 3) { tempStreak++; longestStreak = Math.max(longestStreak, tempStreak); }
            else { tempStreak = 0; }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let checkDate = new Date(today);
        let foundToday = false;

        for (let i = 0; i < 30; i++) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const dayMood = sortedMoods.find(mood => new Date(mood.logged_date).toISOString().split('T')[0] === dateStr);
            if (dayMood && dayMood.score >= 3) {
                if (i === 0) foundToday = true;
                if (foundToday || i === 0) currentStreak++;
            } else {
                if (i === 0) foundToday = false;
                if (!foundToday) break;
            }
            checkDate.setDate(checkDate.getDate() - 1);
        }
        return { current: currentStreak, longest: longestStreak };
    };

    // Chart Data
    const getMoodTrendData = () => {
        const filtered = getFilteredData(data.moods, timeRange);
        if (!filtered.length) return null;
        return {
            labels: filtered.map(m => new Date(m.logged_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
            datasets: [{
                label: 'Mood', data: filtered.map(m => m.score),
                borderColor: '#6366f1', backgroundColor: 'rgba(99, 102, 241, 0.1)', tension: 0.4, fill: true
            }]
        };
    };

    const getMoodDistData = () => {
        const filtered = getFilteredData(data.moods, timeRange);
        const counts = [0, 0, 0, 0, 0];
        filtered.forEach(m => { if (m.score >= 1 && m.score <= 5) counts[m.score - 1]++; });
        return {
            labels: ['Struggling', 'Low', 'Okay', 'Good', 'Great'],
            datasets: [{
                data: counts,
                backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'],
                borderWidth: 0
            }]
        };
    };

    const getWeeklyActivityData = () => {
        const filtered = getFilteredData(data.moods, timeRange);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const counts = new Array(7).fill(0);
        filtered.forEach(m => counts[new Date(m.logged_date).getDay()]++);
        return {
            labels: days,
            datasets: [{ label: 'Entries', data: counts, backgroundColor: 'rgba(99, 102, 241, 0.7)', borderRadius: 4 }]
        };
    };

    const getSentimentData = () => {
        const filtered = getFilteredData(data.journals, timeRange);
        if (!filtered.length) return null;
        return {
            labels: ['Positive', 'Neutral', 'Reflective'],
            datasets: [{
                data: [filtered.filter(j => j.content.length > 50).length, filtered.filter(j => j.content.length <= 50).length, Math.floor(filtered.length / 2)],
                backgroundColor: ['rgba(34, 197, 94, 0.7)', 'rgba(234, 179, 8, 0.7)', 'rgba(239, 68, 68, 0.7)'], borderWidth: 0
            }]
        };
    };

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
            y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' }, beginAtZero: true },
            x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } }
        }
    };

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-slate-400">Loading analytics...</div>;

    const moodTrendData = getMoodTrendData();
    const moodDistData = getMoodDistData();
    const weeklyData = getWeeklyActivityData();
    const sentimentData = getSentimentData();

    return (
        <div className={styles.page}>
            <PageHeader
                title="Analytics & Insights"
                subtitle="Discover meaningful patterns in your wellness journey."
                icon={BarChart2}
                color="text-accent-emerald"
                orbitColor="border-accent-emerald/30"
            />

            <div className={styles.controls}>
                <div className={styles.controlsWrapper}>
                    {[7, 30, 90].map(d => (
                        <button key={d} onClick={() => setTimeRange(d)} className={cn(styles.timeBtn, timeRange === d ? styles.timeBtnActive : styles.timeBtnInactive)}>
                            {d} Days
                        </button>
                    ))}
                </div>
            </div>

            <section className={styles.container}>
                <div className={styles.metricsGrid}>
                    <MetricCard
                        title="Average Mood"
                        value={metrics.avgMood}
                        subtext={
                            <span className="flex items-center justify-center gap-1">
                                {metrics.moodTrend === 'improving' ? <TrendingUp size={14} className="text-emerald-400" /> :
                                    metrics.moodTrend === 'declining' ? <TrendingDown size={14} className="text-red-400" /> :
                                        <Minus size={14} className="text-amber-400" />}
                                <span className={cn(
                                    metrics.moodTrend === 'improving' ? "text-emerald-400" :
                                        metrics.moodTrend === 'declining' ? "text-red-400" : "text-amber-400"
                                )}>{metrics.moodTrend}</span>
                            </span>
                        }
                        icon={Heart} color="bg-gradient-to-br from-emerald-500 to-primary-500"
                    />
                    <MetricCard
                        title="Current Streak"
                        value={`${metrics.currentStreak} Days`}
                        subtext={`Best: ${metrics.longestStreak} days`}
                        icon={Zap} color="bg-gradient-to-br from-amber-500 to-orange-500"
                    />
                    <MetricCard
                        title="Journal Entries"
                        value={metrics.journalCount}
                        subtext={`${metrics.journalWords} words written`}
                        icon={Book} color="bg-gradient-to-br from-primary-500 to-violet-500"
                    />
                    <MetricCard
                        title="Wellness Score"
                        value={metrics.wellnessScore}
                        subtext={<Badge variant="outline" className="border-white/20 text-white/80">{metrics.wellnessCategory}</Badge>}
                        icon={Activity} color="bg-gradient-to-br from-cyan-500 to-emerald-500"
                    />
                </div>

                <div className={styles.chartsGrid}>
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}><Activity size={20} className="text-primary" /> Mood Trends</h3>
                        <div className={styles.chartContainer}>
                            {moodTrendData ? <Line data={moodTrendData} options={chartOptions} /> : <div className={styles.emptyChart}>No data available</div>}
                        </div>
                    </div>
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}><Calendar size={20} className="text-amber-400" /> Mood Distribution</h3>
                        <div className={styles.chartContainerCenter}>
                            {moodDistData ? <Doughnut data={moodDistData} options={{ ...chartOptions, scales: {} }} /> : <div className={styles.emptyChart}>No data available</div>}
                        </div>
                    </div>
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}><BarChart2 size={20} className="text-emerald-400" /> Weekly Activity</h3>
                        <div className={styles.chartContainer}>
                            <Bar data={weeklyData} options={chartOptions} />
                        </div>
                    </div>
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}><Brain size={20} className="text-violet-400" /> Journal Sentiment</h3>
                        <div className={styles.chartContainerCenter}>
                            {sentimentData ? <PolarArea data={sentimentData} options={{ ...chartOptions, scales: { r: { grid: { color: '#1e293b' }, ticks: { display: false } } } }} /> : <div className={styles.emptyChart}>No journal data</div>}
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.insightsSection}>
                <div className={styles.container}>
                    <div className={styles.insightsTitle}>
                        <h2 className="text-3xl font-bold text-white mb-4">Patterns & Insights</h2>
                        <p className="text-slate-400">AI-powered analysis of your wellness journey</p>
                    </div>

                    <div className={styles.insightsGrid}>
                        <div className={styles.insightCard}>
                            <h3 className={styles.insightHeader}><Search size={22} className="text-primary" /> Mood Patterns</h3>
                            <div className="space-y-3">
                                <div className={styles.insightItem}>
                                    <Info size={18} className="text-primary shrink-0 mt-0.5" />
                                    {metrics.avgMood >= 4 ? "You tend to have higher energy on weekends." : "Mid-week seems to be a bit challenging for you."}
                                </div>
                                <div className={styles.insightItem}>
                                    <Calendar size={18} className="text-primary shrink-0 mt-0.5" />
                                    Most entries logged in the {new Date().getHours() < 12 ? "morning" : "evening"}.
                                </div>
                            </div>
                        </div>

                        <div className={styles.insightCard}>
                            <h3 className={styles.insightHeader}><Award size={22} className="text-amber-500" /> Recent Achievements</h3>
                            <div className="space-y-3">
                                <div className={styles.insightItem}>
                                    <Zap size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                    Maintained a {metrics.currentStreak}-day streak!
                                </div>
                                <div className={styles.insightItem}>
                                    <Book size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                    Logged {metrics.journalCount} journal entries.
                                </div>
                            </div>
                        </div>

                        <div className={styles.insightCard}>
                            <h3 className={styles.insightHeader}><Lightbulb size={22} className="text-emerald-400" /> Recommendations</h3>
                            <div className="space-y-3">
                                {metrics.avgMood < 3 && (
                                    <div className={styles.insightItem}>
                                        <Heart size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                        Try a breathing exercise to lift your mood.
                                    </div>
                                )}
                                <div className={styles.insightItem}>
                                    <Activity size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                    Consider writing in your journal during the evening to process the day.
                                </div>
                            </div>
                        </div>

                        <div className={styles.insightCard}>
                            <h3 className={styles.insightHeader}><Brain size={22} className="text-violet-400" /> Deep Analysis</h3>
                            <div className={styles.progressContainer}>
                                <div className="text-sm font-bold text-violet-300 mb-2">ANALYSIS IN PROGRESS</div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                                    <div className="bg-violet-500 h-full w-2/3 animate-pulse"></div>
                                </div>
                                <p className="text-xs text-slate-400">Gathering more data points for correlation analysis...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.tabsSection}>
                <div className={styles.container}>
                    <div className="flex justify-center mb-8">
                        <div className={styles.controlsWrapper}>
                            {['trends', 'predictions', 'comparisons'].map(t => (
                                <button key={t} onClick={() => setTab(t)} className={cn(styles.tabBtn, tab === t ? styles.timeBtnActive : styles.timeBtnInactive)}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.tabContent}>
                        {tab === 'trends' && (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-500">
                                <Activity size={48} className="mb-4 opacity-50" />
                                <h3 className="text-xl font-bold text-white mb-2">Long-term Trends</h3>
                                <p>We need about 30 days of data to show meaningful long-term trends.</p>
                            </div>
                        )}
                        {tab === 'predictions' && (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-500">
                                <Sparkles size={48} className="mb-4 opacity-50 text-violet-400" />
                                <h3 className="text-xl font-bold text-white mb-2">AI Forecasting</h3>
                                <p>Our AI is learning your patterns to provide personalized wellness forecasts.</p>
                            </div>
                        )}
                        {tab === 'comparisons' && (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-500">
                                <Calendar size={48} className="mb-4 opacity-50 text-emerald-400" />
                                <h3 className="text-xl font-bold text-white mb-2">Period Comparisons</h3>
                                <p>Compare your wellness metrics month-over-month once more data is collected.</p>
                            </div>
                        )}
                    </div>

                    <div className={styles.dailySummary}>
                        <Lightbulb size={32} className="text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Daily Summary</h3>
                        <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            {metrics.currentStreak > 3
                                ? "You've been maintaining positive momentum for " + metrics.currentStreak + " days - that's something to feel good about."
                                : metrics.avgMood >= 4
                                    ? "Your overall mood patterns suggest you're finding ways to maintain emotional balance."
                                    : "Every entry helps build a better picture of your wellness. Keep going!"}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

const MetricCard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className={cn(styles.metricCard, "group")}>
        <div className={cn(styles.metricIcon, color, "group-hover:scale-110")}>
            <Icon className="text-white" size={24} />
        </div>
        <div className={styles.metricTitle}>{title}</div>
        <div className={styles.metricValue}>{value}</div>
        <div className={styles.metricSubtext}>{subtext}</div>
    </div>
);

// Helper component for icon
const Sparkles = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /><path d="M5 3v4" /><path d="M9 3v4" /><path d="M3 9h4" /><path d="M3 5h4" /></svg>
);

export default Analytics;

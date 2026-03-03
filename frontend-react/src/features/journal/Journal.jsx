import React, { useState, useEffect } from 'react';
import {
    PenTool, Save, Clock, ChevronDown, ChevronRight, Filter,
    Sparkles, BookOpen, AlertCircle, CheckCircle, Feather, Lightbulb
} from 'lucide-react';
import ApiClient from '../../services/apiClient';
import styles from '../../styles/pages/Journal.module.css';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/utils';
import PageHeader from '../../components/layout/PageHeader';
import GlassCard from '../../components/ui/GlassCard';
import { STORAGE_KEYS } from '../../constants/storage';
import { API_ENDPOINTS } from '../../constants/api';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const Journal = () => {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useLocalStorage(STORAGE_KEYS.JOURNAL_DRAFT, {});
    const [title, setTitle] = useState(draft.title || '');
    const [content, setContent] = useState(draft.content || '');
    const [wordCount, setWordCount] = useState(0);
    const [isPromptsVisible, setIsPromptsVisible] = useState(false);
    const [autosaveStatus, setAutosaveStatus] = useState(''); // 'Saving...', 'Saved locally'
    const [confirmation, setConfirmation] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadEntries();
        if (draft.content) {
            updateWordCount(draft.content);
        }
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (content || title) {
                setDraft({ title, content, timestamp: new Date().toISOString() });
                setAutosaveStatus('Saved locally');
                setTimeout(() => setAutosaveStatus(''), 2000);
            }
        }, 1500);

        if (content || title) setAutosaveStatus('Saving...');

        return () => clearTimeout(timeout);
    }, [title, content]);

    const loadEntries = async () => {
        setLoading(true);
        try {
            const result = await ApiClient.get(API_ENDPOINTS.JOURNAL.LIST);
            if (result.success && result.data) {
                setEntries(result.data);
            }
        } catch (error) {
            console.error('Failed to load journal entries', error);
        } finally {
            setLoading(false);
        }
    };

    const updateWordCount = (text) => {
        const count = text.trim() === '' ? 0 : text.trim().split(/\s+/).filter(word => word.length > 0).length;
        setWordCount(count);
    };

    const handleContentChange = (e) => {
        const val = e.target.value;
        setContent(val);
        updateWordCount(val);
    };

    const handlePromptClick = (prompt) => {
        setContent(prev => prev + (prev ? '\n\n' : '') + prompt + '\n\n');
        setIsPromptsVisible(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        let entryTitle = title.trim();
        if (!entryTitle) {
            const now = new Date();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            entryTitle = `Journal — ${monthNames[now.getMonth()]} ${now.getDate()}`;
        }

        try {
            const result = await ApiClient.post(API_ENDPOINTS.JOURNAL.BASE, {
                title: entryTitle,
                content: content,
                entry_date: new Date().toISOString().split('T')[0]
            });

            if (result.success) {
                setEntries([result.data, ...entries]);
                setTitle('');
                setContent('');
                setWordCount(0);
                setDraft({});
                setConfirmation('Entry saved successfully');
                setTimeout(() => setConfirmation(null), 3000);
            } else {
                setConfirmation('Error saving entry');
            }
        } catch (error) {
            setConfirmation('Error saving entry');
        }
    };

    const getFilteredEntries = () => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        return entries.filter(entry => {
            const date = new Date(entry.created_at || entry.entry_date);
            if (filter === 'week') return date >= weekAgo;
            if (filter === 'month') return date >= monthAgo;
            return true;
        });
    };

    const filtered = getFilteredEntries();
    const prompts = [
        "What am I grateful for in this moment?",
        "How am I feeling right now, and what might be behind that feeling?",
        "What's one thing I learned about myself today?",
        "What would I like to let go of today?"
    ];

    return (
        <div className={styles.page}>
            <PageHeader
                title="Your Journal"
                subtitle="A quiet space for your thoughts. Reflect, grow, and explore."
                icon={BookOpen}
                color="text-accent-cyan"
                orbitColor="border-accent-cyan/30"
            />

            <section className={styles.container}>
                <GlassCard className="max-w-4xl mx-auto shadow-2xl border-white/10">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            className={styles.titleInput}
                            placeholder="Add a title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea
                            className={styles.contentArea}
                            placeholder="What's been on your mind today?"
                            value={content}
                            onChange={handleContentChange}
                        ></textarea>

                        <div className={styles.editorFooter}>
                            <div className="flex items-center gap-4">
                                <div className={cn(styles.autosaveStatus, autosaveStatus ? 'opacity-100' : 'opacity-0')}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                    {autosaveStatus}
                                </div>
                                {!content && (
                                    <button
                                        type="button"
                                        onClick={() => setIsPromptsVisible(!isPromptsVisible)}
                                        className="text-xs text-primary hover:text-primary-400 transition-colors flex items-center gap-1 font-medium"
                                    >
                                        <Sparkles size={14} /> Need a prompt?
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-6">
                                <span className={styles.wordCount}>{wordCount} words</span>
                                <Button size="lg" className="bg-primary hover:bg-primary-600 rounded-full px-8 shadow-lg shadow-primary/25">
                                    <Save size={18} className="mr-2" /> Save Entry
                                </Button>
                            </div>
                        </div>

                        {isPromptsVisible && (
                            <div className={styles.promptsPanel}>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 pl-1">Daily Prompts</h4>
                                {prompts.map((p, i) => (
                                    <button key={i} type="button" onClick={() => handlePromptClick(p)} className={styles.promptBtn}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </form>

                    {confirmation && (
                        <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium animate-fade-in">
                            <CheckCircle size={16} /> {confirmation}
                        </div>
                    )}
                </GlassCard>
            </section>

            <section className={styles.historySection}>
                <div className={styles.container}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white">Your Entries</h2>
                        <div className="relative">
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className={cn(styles.filterSelect, "pl-10")}
                            >
                                <option value="all">All entries</option>
                                <option value="week">This week</option>
                                <option value="month">This month</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center text-slate-500 py-12">Loading entries...</div>
                        ) : filtered.length === 0 ? (
                            <div className={styles.emptyState}>
                                <div className={styles.emptyIcon}>
                                    <Feather size={32} />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">Your journal awaits</h3>
                                <p className="text-slate-400 mb-8 max-w-sm mx-auto">This is where your thoughts and reflections will live. Start writing to begin your journey.</p>
                                <Button
                                    variant="outline"
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                >
                                    <PenTool size={16} className="mr-2" /> Write first entry
                                </Button>
                            </div>
                        ) : (
                            filtered.map(entry => <JournalEntryCard key={entry.id} entry={entry} />)
                        )}
                    </div>
                </div>
            </section>

            <section className="bg-surface/30 pb-20 pt-8">
                <div className={styles.container}>
                    <div className={styles.reflectionCard}>
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Lightbulb className="text-primary" size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm mb-1">AI Reflection</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                {entries.length === 0
                                    ? "Your journal is a space for growth and self-discovery. Each entry is a step in understanding yourself better."
                                    : "Writing regularly helps create clarity in your thoughts and feelings. You're building a valuable practice of self-reflection."
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const JournalEntryCard = ({ entry }) => {
    const [expanded, setExpanded] = useState(false);
    const date = new Date(entry.created_at || entry.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const time = new Date(entry.created_at || entry.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return (
        <div className={`${styles.entryCard} group`} onClick={() => setExpanded(!expanded)}>
            <div className={styles.entryHeader}>
                <div>
                    {entry.title && <h4 className={`${styles.entryTitle} group-hover:text-primary`}>{entry.title}</h4>}
                    <div className={styles.entryMeta}>
                        <Clock size={12} /> {date} • {time}
                    </div>
                </div>
                {expanded ? <ChevronDown className="text-slate-500" size={18} /> : <ChevronRight className="text-slate-500" size={18} />}
            </div>

            {expanded ? (
                <div className={styles.entryContentExpanded}>
                    {entry.content}
                </div>
            ) : (
                <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                    {entry.content.substring(0, 150)}{entry.content.length > 150 ? '...' : ''}
                </p>
            )}
        </div>
    );
};

export default Journal;

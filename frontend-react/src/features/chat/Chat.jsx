import React, { useState, useEffect, useRef } from 'react';
import {
    MessageCircle, ClipboardList, Send, RotateCcw, ArrowLeft, ArrowRight,
    Smile, Zap, Activity, Moon, Heart, Leaf, Sun, Shield, Info, Check
} from 'lucide-react';
import ApiClient from '../../services/apiClient';
import { API_ENDPOINTS } from '../../constants/api';
import styles from '../../styles/pages/Chat.module.css';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/utils';
import PageHeader from '../../components/layout/PageHeader';
import ReactMarkdown from 'react-markdown';

const Chat = () => {
    const [mode, setMode] = useState('assessment'); // 'assessment' | 'chat'

    return (
        <div className={styles.page}>
            <PageHeader
                title="A Space to Talk"
                subtitle="Reflect through guided questions or chat openly with our compassionate AI."
                icon={MessageCircle}
                color="text-accent-violet"
                orbitColor="border-accent-violet/30"
            />

            {/* Mode Toggle */}
            <section className={styles.modeToggle}>
                <button
                    onClick={() => setMode('assessment')}
                    className={cn(styles.toggleButton, mode === 'assessment' ? [styles.toggleActive, "shadow-[0_0_15px_rgba(14,165,233,0.2)]"] : styles.toggleInactive)}
                >
                    <ClipboardList size={24} />
                    <div className="text-left">
                        <div className="font-semibold">Guided Check-in</div>
                        <div className="text-xs opacity-80">Structured reflection</div>
                    </div>
                </button>
                <button
                    onClick={() => setMode('chat')}
                    className={cn(styles.toggleButton, mode === 'chat' ? [styles.toggleActive, "shadow-[0_0_15px_rgba(14,165,233,0.2)]"] : styles.toggleInactive)}
                >
                    <MessageCircle size={24} />
                    <div className="text-left">
                        <div className="font-semibold">Open Chat</div>
                        <div className="text-xs opacity-80">Free conversation</div>
                    </div>
                </button>
            </section>

            {/* Content */}
            <section className={styles.container}>
                {mode === 'assessment' ? (
                    <GuidedCheckIn onSwitchToChat={() => setMode('chat')} />
                ) : (
                    <OpenChat />
                )}
            </section>
        </div>
    );
};

// --- Guided Check-in Component ---
const GuidedCheckIn = ({ onSwitchToChat }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [completed, setCompleted] = useState(false);

    const questions = [
        {
            id: 'mood',
            question: 'Let\'s start with your baseline. How have you been feeling overall?',
            type: 'emoji-scale',
            options: [
                { value: 1, emoji: '😔', label: 'Struggling' },
                { value: 2, emoji: '😐', label: 'Low' },
                { value: 3, emoji: '🙂', label: 'Okay' },
                { value: 4, emoji: '😊', label: 'Better' },
                { value: 5, emoji: '😄', label: 'Good' }
            ]
        },
        {
            id: 'energy',
            question: 'How would you rate your mental and physical reserves?',
            type: 'slider',
            min: 0,
            max: 100,
            labels: ['Drained', 'Energized']
        },
        {
            id: 'stress',
            question: 'How heavy does the weight of your responsibilities feel?',
            type: 'slider',
            min: 0,
            max: 100,
            labels: ['Overwhelmed', 'Manageable']
        },
        {
            id: 'sleep',
            question: 'Are your nights bringing you the rest you need?',
            type: 'choice',
            options: [
                { value: 'poor', label: 'Frequently restless' },
                { value: 'inconsistent', label: 'Mixed / Inconsistent' },
                { value: 'decent', label: 'Generally okay' },
                { value: 'good', label: 'Restful & consistent' }
            ]
        },
        {
            id: 'connection',
            question: 'Do you feel understood and supported by those around you?',
            type: 'choice',
            options: [
                { value: 'isolated', label: 'Feeling alone' },
                { value: 'limited', label: 'Wish for more support' },
                { value: 'moderate', label: 'Reasonably supported' },
                { value: 'strong', label: 'Well-supported' }
            ]
        },
        {
            id: 'coping',
            question: 'When faced with a setback, how are you reacting?',
            type: 'choice',
            options: [
                { value: 'struggling', label: 'Finding it very difficult' },
                { value: 'managing', label: 'Just getting by' },
                { value: 'adapting', label: 'Handling reasonably well' },
                { value: 'resilient', label: 'Feeling capable' }
            ]
        },
        {
            id: 'activities',
            question: 'Are you still finding joy in the things you usually love?',
            type: 'choice',
            options: [
                { value: 'disengaged', label: 'Lost interest' },
                { value: 'limited', label: 'Less enthusiasm' },
                { value: 'selective', label: 'Enjoying some things' },
                { value: 'engaged', label: 'Actively enjoying' }
            ]
        },
        {
            id: 'outlook',
            question: 'When you think about tomorrow, what comes to mind?',
            type: 'choice',
            options: [
                { value: 'pessimistic', label: 'Uncertain / Worried' },
                { value: 'neutral', label: 'One day at a time' },
                { value: 'cautiously_optimistic', label: 'Cautiously hopeful' },
                { value: 'optimistic', label: 'Positive' }
            ]
        },
        {
            id: 'reflection',
            question: 'Is there anything specific you\'d like the AI Companion to know before we chat?',
            type: 'text',
            placeholder: 'Optional...',
            optional: true
        }
    ];

    const currentQ = questions[step];

    const handleAnswer = (val) => {
        setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
    };

    const nextStep = () => {
        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            setCompleted(true);
            saveAssessment();
        }
    };

    const prevStep = () => {
        if (step > 0) setStep(step - 1);
    };

    const saveAssessment = async () => {
        try {
            await ApiClient.post(API_ENDPOINTS.ASSESSMENT.BASE, { responses: answers, assessment_type: 'wellness' });
        } catch (e) {
            console.error(e);
        }
    };

    const calculateReview = () => {
        const moodScore = parseInt(answers.mood) || 3;
        const energyScore = parseInt(answers.energy) || 50;
        const stressScore = 100 - (parseInt(answers.stress) || 50);
        const overallScore = Math.round((moodScore * 20 + energyScore + stressScore) / 3);

        let status = {
            level: 'balanced',
            color: 'text-accent-cyan',
            message: "You're doing a solid job navigating everything on your plate, though your responses gently suggest there are areas craving a little more care. It's completely normal to feel stretched when managing multiple demands. In our open chat, perhaps we can unpack the specific areas where you feel your reserves are lowest, and find small ways to restore balance."
        };

        if (overallScore >= 75) {
            status = {
                level: 'strong',
                color: 'text-accent-emerald',
                message: "You're showing wonderful resilience and a positive baseline today. Your responses indicate that your foundational pillars are currently well-supported, giving you the capacity to handle daily demands gracefully. Let's use our conversation to explore how we can maintain and build upon this great momentum!"
            };
        } else if (overallScore < 50) {
            status = {
                level: 'needs attention',
                color: 'text-accent-amber',
                message: "Thank you for being so honest in your reflections. It sounds like you are carrying a lot of weight right now, and things are feeling significantly challenging. When energy is low and stress is high, even getting through the day takes profound strength. Please know that this is exactly what this space is for—let's use our chat to slowly unpack what's overwhelming you without any pressure."
            };
        }

        const insights = [];
        if (answers.sleep === 'poor') insights.push({ icon: Moon, message: 'Sleep challenges can affect many aspects of wellbeing. Consider gentle sleep hygiene practices.' });
        if (answers.sleep === 'good') insights.push({ icon: Moon, message: 'Good sleep is a wonderful foundation for mental wellness.' });

        if (answers.connection === 'isolated') insights.push({ icon: Heart, message: 'Feeling disconnected is hard. Small steps toward connection can make a difference.' });
        if (answers.connection === 'strong') insights.push({ icon: Heart, message: 'Strong support connections are a valuable resource.' });

        if (answers.coping === 'struggling') insights.push({ icon: Leaf, message: 'When challenges feel overwhelming, focus on one small thing at a time.' });
        if (answers.coping === 'resilient') insights.push({ icon: Leaf, message: 'Your resilience is showing through in how you handle challenges.' });

        if (answers.outlook === 'pessimistic') insights.push({ icon: Sun, message: 'When the future feels uncertain, focusing on the present moment can help.' });
        if (answers.outlook === 'optimistic') insights.push({ icon: Sun, message: 'A positive outlook can be a powerful motivator.' });

        if (answers.activities === 'disengaged') insights.push({ icon: Activity, message: 'Losing interest in activities is common. Be gentle with yourself.' });

        return { overallScore, moodScore, energyScore, stressScore, status, insights: insights.slice(0, 3) };
    };

    if (completed) {
        const review = calculateReview();
        const getEmoji = (s) => ['😔', '😐', '🙂', '😊', '😄'][s - 1] || '😐';

        return (
            <div className={styles.assessmentCard}>
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/20">
                    <Heart size={32} className="text-primary fill-current" />
                </div>
                <h3 className="text-3xl font-heading font-bold mb-4 text-center text-white">Thank you for reflecting</h3>

                <div className="bg-slate-900/50 rounded-xl p-8 mb-8 border border-white/5">
                    <h4 className="font-semibold text-white mb-3 text-lg">Your Wellness Snapshot</h4>
                    <p className="text-slate-300 mb-8 leading-relaxed">{review.status.message}</p>

                    <div className="grid grid-cols-3 gap-6 mb-8">
                        <div className="text-center bg-white/5 rounded-lg p-4">
                            <div className={cn("text-4xl mb-2", review.status.color)}>{getEmoji(review.moodScore)}</div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Emotional</div>
                        </div>
                        <div className="text-center bg-white/5 rounded-lg p-4">
                            <div className={cn("text-3xl font-bold mb-2", review.energyScore >= 60 ? 'text-accent-emerald' : review.energyScore >= 40 ? 'text-accent-cyan' : 'text-accent-amber')}>
                                <Zap className="inline-block" size={28} />
                            </div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Energy</div>
                        </div>
                        <div className="text-center bg-white/5 rounded-lg p-4">
                            <div className={cn("text-3xl font-bold mb-2", review.stressScore >= 60 ? 'text-accent-emerald' : review.stressScore >= 40 ? 'text-accent-cyan' : 'text-accent-amber')}>
                                <Leaf className="inline-block" size={28} />
                            </div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stress</div>
                        </div>
                    </div>

                    {review.insights.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-white mb-4 border-t border-white/10 pt-4">Gentle Observations</h4>
                            <div className="space-y-4">
                                {review.insights.map((insight, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <insight.icon size={20} className="text-primary mt-0.5 shrink-0" />
                                        <p className="text-slate-300 text-sm">{insight.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {answers.reflection && answers.reflection.trim() && (
                        <div className="bg-slate-800/50 rounded-lg p-6 mt-8 border border-white/5">
                            <h4 className="font-semibold text-white mb-2">Whatever you shared</h4>
                            <p className="text-slate-300 italic mb-2">"{answers.reflection}"</p>
                            <p className="text-xs text-slate-500">Your thoughts are important.</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-center gap-4">
                    <Button onClick={onSwitchToChat} size="lg" className="px-8 bg-primary hover:bg-primary-600 border-0">
                        <MessageCircle className="mr-2" size={20} /> Continue Chatting
                    </Button>
                    <Button
                        onClick={() => { setStep(0); setAnswers({}); setCompleted(false); }}
                        variant="secondary"
                        size="lg"
                        className="bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border-0"
                    >
                        <RotateCcw className="mr-2" size={20} /> Reflect Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.assessmentCard}>
            <div className={styles.progressContainer}>
                <div className={styles.progressHeader}>
                    <span>Step {step + 1} of {questions.length}</span>
                    <button onClick={nextStep} className="hover:text-primary transition-colors text-xs uppercase font-medium tracking-wide">Skip</button>
                </div>
                <div className={styles.track}>
                    <div className={styles.bar} style={{ width: `${((step + 1) / questions.length) * 100}%` }}></div>
                </div>
            </div>

            <div className="min-h-[400px] flex flex-col justify-center animate-fade-in relative">
                <h3 className={styles.questionTitle}>{currentQ.question}</h3>

                {currentQ.type === 'emoji-scale' && (
                    <div className={styles.emojiGrid}>
                        {currentQ.options.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handleAnswer(opt.value)}
                                className={cn(styles.emojiBtn, answers[currentQ.id] === opt.value ? styles.emojiBtnActive : styles.emojiBtnInactive)}
                            >
                                <span className="text-4xl mb-2 transition-transform">{opt.emoji}</span>
                                <span className="text-sm font-medium">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                )}

                {currentQ.type === 'slider' && (
                    <div className={styles.sliderContainer}>
                        <div className="flex justify-between text-sm text-slate-400 mb-6 font-medium">
                            <span>{currentQ.labels[0]}</span>
                            <span>{currentQ.labels[1]}</span>
                        </div>
                        <input
                            type="range" min={currentQ.min} max={currentQ.max}
                            value={answers[currentQ.id] || 50}
                            onChange={(e) => handleAnswer(e.target.value)}
                            className={styles.rangeInput}
                        />
                        <div className="text-center mt-6">
                            <span className="text-3xl font-bold text-primary">{answers[currentQ.id] || 50}</span>
                        </div>
                    </div>
                )}

                {currentQ.type === 'choice' && (
                    <div className={styles.choiceGrid}>
                        {currentQ.options.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handleAnswer(opt.value)}
                                className={cn(styles.choiceBtn, answers[currentQ.id] === opt.value ? styles.choiceBtnActive : styles.choiceBtnInactive)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}

                {currentQ.type === 'text' && (
                    <textarea
                        className={styles.textArea}
                        placeholder={currentQ.placeholder}
                        value={answers[currentQ.id] || ''}
                        onChange={(e) => handleAnswer(e.target.value)}
                    ></textarea>
                )}
            </div>

            <div className="flex justify-between mt-10 pt-6 border-t border-white/5">
                <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={step === 0}
                    className="text-slate-400 hover:text-white pl-0 hover:bg-transparent"
                >
                    <ArrowLeft className="mr-2" size={18} /> Previous
                </Button>
                <Button
                    onClick={nextStep}
                    disabled={!currentQ.optional && !answers[currentQ.id]}
                    className="bg-primary hover:bg-primary-600 px-8 disabled:opacity-50"
                >
                    Continue <ArrowRight className="ml-2" size={18} />
                </Button>
            </div>
        </div>
    );
};

// --- Open Chat Component ---
const OpenChat = () => {
    const [messages, setMessages] = useState([
        { sender: 'assistant', text: "Hello! I'm here to listen and support you. What's been on your mind today?", timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const [crisisDetected, setCrisisDetected] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typing]);

    // Enhanced crisis keywords
    const crisisKeywords = [
        'suicide', 'kill myself', 'end it all', 'hurt myself', 'want to die',
        'hopeless', 'harm myself', 'better off dead', 'no point',
        'end my life', 'can\'t go on', 'give up', 'no way out'
    ];

    const checkCrisis = (text) => {
        const lower = text.toLowerCase();
        if (crisisKeywords.some(kw => lower.includes(kw))) {
            setCrisisDetected(true);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        const text = input.trim();
        setInput('');
        setMessages(prev => [...prev, { sender: 'user', text, timestamp: new Date() }]);
        checkCrisis(text);
        setTyping(true);

        try {
            const result = await ApiClient.post('/api/ai/chat', { text: text });

            // Expected response format from backend: { reply: "...", type: "...", confidence: 0.9 }
            let replyText = "I'm listening. Please go on.";

            console.log("Chat API Response:", JSON.stringify(result));

            // Use the API's reply if successful
            if (result.success && result.data) {
                const responseData = result.data;
                console.log("Data Payload:", JSON.stringify(responseData));
                console.log("Reply String:", responseData.reply);
                replyText = responseData.reply || replyText;

                if (responseData.type === 'crisis') {
                    setCrisisDetected(true);
                }
            } else {
                replyText = "I'm having trouble connecting right now, but I'm here for you.";
            }

            setMessages(prev => [...prev, { sender: 'assistant', text: replyText, timestamp: new Date() }]);
            setTyping(false);

        } catch (e) {
            setTyping(false);
            setMessages(prev => [...prev, { sender: 'assistant', text: "I'm having trouble connecting right now, but I'm here for you.", timestamp: new Date() }]);
        }
    };

    return (
        <div className={styles.chatContainer}>
            {/* Header */}
            <div className={styles.chatHeader}>
                <div className={cn(styles.avatar, styles.avatarAI)}>
                    <Leaf size={20} />
                </div>
                <div>
                    <h3 className="font-semibold text-white">YuVA Companion</h3>
                    <div className="flex items-center text-xs text-emerald-400">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
                        Online
                    </div>
                </div>
            </div>

            {/* Crisis Banner */}
            {crisisDetected && (
                <div className={styles.crisisBanner}>
                    <div className="p-2 bg-red-500/20 rounded-lg h-fit flex shrink-0">
                        <Heart size={20} className="text-red-400" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-200 mb-2 font-medium">I hear that you're going through a difficult time. You are not alone.</p>
                        <a href="/resources" className="text-xs text-red-300 hover:text-white underline font-medium block">View crisis resources immediately</a>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className={styles.messagesArea}>
                {messages.map((msg, i) => (
                    <div key={i} className={cn(styles.messageRow, msg.sender === 'user' ? styles.messageRowUser : styles.messageRowAI)}>
                        {msg.sender === 'assistant' && (
                            <div className={cn(styles.avatar, styles.avatarAI, "mr-3 w-8 h-8 self-end mb-1")}>
                                <Leaf size={14} />
                            </div>
                        )}
                        <div className={cn(styles.bubble, msg.sender === 'user' ? styles.bubbleUser : styles.bubbleAI)}>
                            {msg.sender === 'assistant' ? (
                                <div className={cn(styles.markdownContent, "prose prose-sm prose-invert max-w-none")}>
                                    <ReactMarkdown>
                                        {msg.text || ""}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p>{msg.text}</p>
                            )}
                        </div>
                    </div>
                ))}
                {typing && (
                    <div className={styles.messageRowAI}>
                        <div className={cn(styles.avatar, styles.avatarAI, "mr-3 w-8 h-8 self-end mb-1")}>
                            <Leaf size={14} />
                        </div>
                        <div className={cn(styles.bubble, styles.bubbleAI, "flex items-center gap-1 h-10")}>
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={styles.inputArea}>
                {!input && (
                    <div className={styles.quickReplies}>
                        {["I'm feeling anxious", "I'm having a good day", "I feel overwhelmed", "Need encouragement"].map((qr, i) => (
                            <button key={i} onClick={() => setInput(qr)} className={styles.quickReplyBtn}>
                                {qr}
                            </button>
                        ))}
                    </div>
                )}

                <div className={styles.inputWrapper}>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        className={styles.chatInput}
                        placeholder="Type a message..."
                        rows={1}
                    ></textarea>
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={styles.sendBtn}
                    >
                        <div className="p-2 bg-primary rounded-lg text-white hover:bg-primary-600 transition-colors">
                            <Send size={18} />
                        </div>
                    </button>
                </div>
                <div className="flex justify-between mt-3 text-[10px] text-slate-500 px-2 uppercase tracking-wider font-semibold">
                    <span className="flex items-center gap-1"><Shield size={10} /> Private & Secure</span>
                    <button onClick={() => setMessages([])} className="hover:text-slate-300 transition-colors">Clear chat</button>
                </div>
            </div>
        </div>
    );
};

export default Chat;

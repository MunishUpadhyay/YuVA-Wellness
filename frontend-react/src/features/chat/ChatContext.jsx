import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';

const ChatContext = createContext();

const INITIAL_MESSAGES = [
    {
        sender: 'assistant',
        text: "Hello! I'm here to listen and support you. What's been on your mind today?",
        timestamp: new Date()
    }
];

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();

    // Open Chat State
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [chatInput, setChatInput] = useState('');
    const [crisisDetected, setCrisisDetected] = useState(false);

    // General Mode State
    const [mode, setMode] = useState('assessment'); // 'assessment' | 'chat'

    // Guided Check-in State
    const [assessmentStep, setAssessmentStep] = useState(0);
    const [assessmentAnswers, setAssessmentAnswers] = useState({});
    const [assessmentCompleted, setAssessmentCompleted] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gemini-flash-latest');

    // Clear state on logout
    useEffect(() => {
        if (!user) {
            setMessages(INITIAL_MESSAGES);
            setChatInput('');
            setCrisisDetected(false);
            setMode('assessment');
            setAssessmentStep(0);
            setAssessmentAnswers({});
            setAssessmentCompleted(false);
        }
    }, [user]);

    const clearChat = () => {
        setMessages(INITIAL_MESSAGES);
        setChatInput('');
        setCrisisDetected(false);
    };

    const value = {
        messages,
        setMessages,
        chatInput,
        setChatInput,
        crisisDetected,
        setCrisisDetected,
        mode,
        setMode,
        assessmentStep,
        setAssessmentStep,
        assessmentAnswers,
        setAssessmentAnswers,
        assessmentCompleted,
        setAssessmentCompleted,
        selectedModel,
        setSelectedModel,
        clearChat
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

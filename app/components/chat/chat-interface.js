/**
 * YuVA Wellness - Chat Interface Component
 * Handles real-time streaming chat with mental health support
 */

class ChatInterfaceComponent {
    constructor(containerId = 'chat-container') {
        this.containerId = containerId;
        this.messages = [];
        this.currentLanguage = YuvaUtils.StorageUtils.get('yuva-language', 'en');
        this.isTyping = false;
        this.sounds = null;
        
        this.init();
    }

    init() {
        this.setupElements();
        this.initializeSounds();
        this.setupEventListeners();
        this.showWelcomeMessage();
    }

    setupElements() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Chat container ${this.containerId} not found`);
            return;
        }

        this.messagesContainer = container.querySelector('#chat-messages');
        this.chatInput = container.querySelector('#chat-input');
        this.sendButton = container.querySelector('#send-button');
        this.sendIcon = container.querySelector('#send-icon');
        this.loadingSpinner = container.querySelector('#loading-spinner');
        this.statusText = container.querySelector('#status-text');
    }

    initializeSounds() {
        try {
            if (window.ChatSounds) {
                this.sounds = new window.ChatSounds();
            } else {
                // Fallback sound object
                this.sounds = {
                    messageSent: () => {},
                    messageReceived: () => {},
                    typing: () => {},
                    error: () => {},
                    crisis: () => {},
                    toggleSound: () => false
                };
            }
        } catch (error) {
            console.warn('Failed to initialize chat sounds:', error);
            this.sounds = {
                messageSent: () => {},
                messageReceived: () => {},
                typing: () => {},
                error: () => {},
                crisis: () => {},
                toggleSound: () => false
            };
        }
    }

    setupEventListeners() {
        if (!this.chatInput) return;

        // Auto-resize textarea
        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = Math.min(this.chatInput.scrollHeight, 120) + 'px';
        });

        // Handle Enter key
        this.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Send button click
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Focus input
        this.chatInput.focus();
    }

    showWelcomeMessage() {
        setTimeout(() => {
            const welcomeMessage = this.getWelcomeMessage();
            this.addMessage('bot', welcomeMessage);
            this.messages.push({ role: 'assistant', content: welcomeMessage });
        }, 500);
    }

    getWelcomeMessage() {
        const hour = new Date().getHours();
        let greeting = 'Hello';
        
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 17) greeting = 'Good afternoon';
        else greeting = 'Good evening';

        const welcomeMessages = [
            `${greeting}! I'm YuVA, your AI wellness companion. I'm here to listen, support, and help you navigate your mental health journey. How are you feeling today?`,
            `${greeting}! Welcome to our safe space. I'm YuVA, and I'm here to provide a non-judgmental ear and gentle guidance. What's on your mind?`,
            `${greeting}! I'm YuVA, your personal wellness companion. Whether you're having a great day or facing challenges, I'm here to support you. How can I help today?`
        ];

        return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    }

    addMessage(sender, content, isTyping = false) {
        if (!this.messagesContainer) return null;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const time = YuvaUtils.DateUtils.formatTime(new Date());
        
        if (sender === 'bot') {
            if (isTyping) {
                messageDiv.innerHTML = `
                    <div class="message-avatar">🧠</div>
                    <div class="typing-indicator">
                        <span>YuVA is typing</span>
                        <div class="typing-dots">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                    </div>
                `;
                this.sounds.typing();
            } else {
                messageDiv.innerHTML = `
                    <div class="message-avatar">🧠</div>
                    <div class="message-content">
                        ${this.formatMessage(content)}
                        <div class="message-time">${time}</div>
                    </div>
                `;
                this.sounds.messageReceived();
            }
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${this.formatMessage(content)}
                    <div class="message-time">${time}</div>
                </div>
                <div class="message-avatar">👤</div>
            `;
            this.sounds.messageSent();
        }

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }

    formatMessage(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        if (this.isTyping) return null;
        
        this.isTyping = true;
        if (this.statusText) {
            this.statusText.textContent = 'YuVA is typing...';
        }
        
        const typingDiv = this.addMessage('bot', '', true);
        typingDiv.id = 'typing-indicator';
        
        return typingDiv;
    }

    hideTypingIndicator() {
        this.isTyping = false;
        if (this.statusText) {
            this.statusText.textContent = 'Online and ready to help';
        }
        
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    setLoading(loading) {
        if (!this.sendButton) return;
        
        this.sendButton.disabled = loading;
        
        if (this.sendIcon && this.loadingSpinner) {
            if (loading) {
                this.sendIcon.style.display = 'none';
                this.loadingSpinner.style.display = 'block';
            } else {
                this.sendIcon.style.display = 'block';
                this.loadingSpinner.style.display = 'none';
            }
        }
    }

    async sendMessage() {
        const content = this.chatInput?.value?.trim();
        if (!content || this.isTyping) return;

        // Add user message
        this.addMessage('user', content);
        this.messages.push({ role: 'user', content });
        
        // Clear input and show loading
        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';
        this.setLoading(true);
        
        // Show typing indicator
        const typingDelay = Math.min(Math.max(content.length * 50, 1000), 3000);
        const typingDiv = this.showTypingIndicator();
        
        try {
            await new Promise(resolve => setTimeout(resolve, typingDelay));
            
            // Try streaming first, fallback to regular chat
            await this.handleStreamingResponse();
            
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Chat error:', error);
            
            this.sounds.error();
            
            const errorMessages = [
                "I'm having trouble connecting right now, but I'm still here with you. Please try again in a moment.",
                "Something went wrong on my end, but that doesn't change that I care about what you're going through. Let's try again.",
                "I'm experiencing some technical difficulties, but your feelings and experiences are still valid and important. Please try sending your message again."
            ];
            
            const errorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
            this.addMessage('bot', errorMessage);
            
        } finally {
            this.setLoading(false);
            if (this.chatInput) this.chatInput.focus();
        }
    }

    async handleStreamingResponse() {
        this.hideTypingIndicator();
        
        // Create message container for streaming
        const messageDiv = this.addMessage('bot', '', false);
        const contentDiv = messageDiv.querySelector('.message-content');
        let streamedContent = '';
        
        try {
            const response = await fetch('/api/chat/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    messages: this.messages, 
                    lang: this.currentLanguage 
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.type === 'metadata') {
                                if (data.crisis) {
                                    this.showCrisisAlert();
                                }
                            } else if (data.type === 'chunk') {
                                streamedContent += data.content;
                                contentDiv.innerHTML = this.formatMessage(streamedContent) + 
                                    '<div class="message-time">' + YuvaUtils.DateUtils.formatTime(new Date()) + '</div>';
                                this.scrollToBottom();
                                
                                if (Math.random() < 0.1) {
                                    this.sounds.typing();
                                }
                            } else if (data.type === 'complete') {
                                const finalContent = data.full_response || streamedContent;
                                contentDiv.innerHTML = this.formatMessage(finalContent) + 
                                    '<div class="message-time">' + YuvaUtils.DateUtils.formatTime(new Date()) + '</div>';
                                
                                this.messages.push({ role: 'assistant', content: finalContent });
                                this.sounds.messageReceived();
                            } else if (data.type === 'error') {
                                throw new Error(data.error);
                            }
                        } catch (parseError) {
                            console.warn('Failed to parse streaming data:', parseError);
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('Streaming error:', error);
            // Fallback to regular response
            await this.handleRegularResponse();
        }
    }

    async handleRegularResponse() {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                messages: this.messages, 
                lang: this.currentLanguage 
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        this.hideTypingIndicator();
        
        setTimeout(() => {
            this.addMessage('bot', data.reply || "I'm here for you, even when words are hard to find.");
            this.messages.push({ role: 'assistant', content: data.reply || '' });
            
            if (data.crisis) {
                setTimeout(() => {
                    this.showCrisisAlert();
                }, 1000);
            }
        }, 300);
    }

    showCrisisAlert() {
        this.sounds.crisis();
        
        const alertDiv = document.createElement('div');
        alertDiv.className = 'crisis-alert';
        alertDiv.innerHTML = `
            <h4>🚨 Your Safety Matters</h4>
            <p>I'm concerned about you. If you're having thoughts of self-harm, please reach out for immediate help:</p>
            <p><strong>Crisis Helplines:</strong><br>
            • National Suicide Prevention Lifeline: 988<br>
            • Crisis Text Line: Text HOME to 741741<br>
            • Or contact your local emergency services: 911</p>
        `;
        
        if (this.messagesContainer) {
            this.messagesContainer.appendChild(alertDiv);
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        YuvaUtils.StorageUtils.set('yuva-language', lang);
        
        const langMessage = lang === 'hi-en' 
            ? 'Language set to Hinglish. Hum ab Hinglish mein baat kar sakte hain! 🇮🇳'
            : 'Language set to English. We can continue our conversation in English! 🇺🇸';
            
        this.addMessage('bot', langMessage);
    }

    sendQuickMessage(message) {
        if (this.chatInput) {
            this.chatInput.value = message;
            this.sendMessage();
        }
    }

    toggleSounds() {
        if (this.sounds) {
            const enabled = this.sounds.toggleSound();
            const message = enabled 
                ? 'Sound effects enabled! 🔊' 
                : 'Sound effects disabled 🔇';
            this.addMessage('bot', message);
            return enabled;
        }
        return false;
    }
}

// Export for global use
window.ChatInterfaceComponent = ChatInterfaceComponent;
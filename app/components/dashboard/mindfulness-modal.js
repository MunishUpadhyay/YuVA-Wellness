/**
 * YuVA Wellness - Interactive Mindfulness Modal Component
 * Provides guided mindfulness sessions with timer and progress tracking
 */

class MindfulnessModal {
    constructor() {
        this.currentSession = null;
        this.sessionTimer = null;
    }

    create() {
        // Remove existing modal if present
        const existingModal = document.getElementById('mindfulness-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modal = document.createElement('div');
        modal.id = 'mindfulness-modal';
        modal.innerHTML = this.getModalHTML();
        
        // Add modal styles
        this.addModalStyles();
        document.body.appendChild(modal);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    getModalHTML() {
        return `
            <div class="mindfulness-overlay" onclick="mindfulnessModal.close()">
                <div class="mindfulness-container" onclick="event.stopPropagation()">
                    <div class="mindfulness-header">
                        <h2>🧘 Guided Mindfulness Session</h2>
                        <button class="close-btn" onclick="mindfulnessModal.close()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="mindfulness-content" id="mindfulness-session-content">
                        <div class="session-selector">
                            <h3>Choose Your Mindfulness Experience</h3>
                            <div class="session-options">
                                <div class="session-card" onclick="mindfulnessModal.startBreathingExercise()">
                                    <div class="session-icon">🫁</div>
                                    <h4>Breathing Exercise</h4>
                                    <p>4-7-8 breathing technique for instant calm</p>
                                    <span class="duration">3-5 minutes</span>
                                </div>
                                
                                <div class="session-card" onclick="mindfulnessModal.startBodyScan()">
                                    <div class="session-icon">🧘‍♀️</div>
                                    <h4>Body Scan</h4>
                                    <p>Progressive relaxation from head to toe</p>
                                    <span class="duration">8-10 minutes</span>
                                </div>
                                
                                <div class="session-card" onclick="mindfulnessModal.startGroundingExercise()">
                                    <div class="session-icon">🌱</div>
                                    <h4>5-4-3-2-1 Grounding</h4>
                                    <p>Connect with your senses in the present</p>
                                    <span class="duration">5-7 minutes</span>
                                </div>
                                
                                <div class="session-card" onclick="mindfulnessModal.startLovingKindness()">
                                    <div class="session-icon">💝</div>
                                    <h4>Loving Kindness</h4>
                                    <p>Cultivate compassion for self and others</p>
                                    <span class="duration">6-8 minutes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    addModalStyles() {
        if (document.getElementById('mindfulness-modal-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'mindfulness-modal-styles';
        style.textContent = `
            .mindfulness-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                backdrop-filter: blur(5px);
            }
            
            .mindfulness-container {
                background: var(--bg-card);
                border-radius: var(--border-radius-lg);
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .mindfulness-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--spacing-lg);
                border-bottom: 1px solid var(--border-color);
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: white;
                border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
            }
            
            .mindfulness-header h2 {
                margin: 0;
                font-size: 1.5rem;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: var(--spacing-xs);
                border-radius: var(--border-radius);
                transition: background 0.2s ease;
            }
            
            .close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .mindfulness-content {
                padding: var(--spacing-lg);
            }
            
            .session-selector h3 {
                text-align: center;
                margin-bottom: var(--spacing-lg);
                color: var(--text-primary);
            }
            
            .session-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: var(--spacing-md);
            }
            
            .session-card {
                background: var(--bg-secondary);
                border: 2px solid var(--border-color);
                border-radius: var(--border-radius-lg);
                padding: var(--spacing-lg);
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .session-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transition: left 0.5s ease;
            }
            
            .session-card:hover {
                border-color: var(--primary);
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            
            .session-card:hover::before {
                left: 100%;
            }
            
            .session-icon {
                font-size: 3rem;
                margin-bottom: var(--spacing-sm);
            }
            
            .session-card h4 {
                margin: var(--spacing-sm) 0;
                color: var(--primary);
                font-size: 1.2rem;
            }
            
            .session-card p {
                color: var(--text-secondary);
                margin-bottom: var(--spacing-md);
                line-height: 1.5;
            }
            
            .duration {
                display: inline-block;
                background: var(--primary);
                color: white;
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--border-radius);
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .session-active {
                text-align: center;
                padding: var(--spacing-xl);
            }
            
            .session-timer {
                font-size: 4rem;
                font-weight: bold;
                color: var(--primary);
                margin: var(--spacing-lg) 0;
                font-family: 'Courier New', monospace;
            }
            
            .session-instruction {
                font-size: 1.2rem;
                color: var(--text-primary);
                margin: var(--spacing-lg) 0;
                line-height: 1.6;
            }
            
            .session-controls {
                display: flex;
                gap: var(--spacing-md);
                justify-content: center;
                margin-top: var(--spacing-lg);
            }
            
            .control-btn {
                padding: var(--spacing-sm) var(--spacing-lg);
                border: none;
                border-radius: var(--border-radius);
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
            }
            
            .btn-primary {
                background: var(--primary);
                color: white;
            }
            
            .btn-secondary {
                background: var(--bg-secondary);
                color: var(--text-primary);
                border: 1px solid var(--border-color);
            }
            
            .control-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            }
            
            .breathing-circle {
                width: 200px;
                height: 200px;
                border: 3px solid var(--primary);
                border-radius: 50%;
                margin: var(--spacing-lg) auto;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                color: var(--primary);
                transition: transform 4s ease-in-out;
            }
            
            .breathing-circle.inhale {
                transform: scale(1.3);
                background: rgba(108, 92, 231, 0.1);
            }
            
            .breathing-circle.exhale {
                transform: scale(0.8);
                background: rgba(108, 92, 231, 0.05);
            }
            
            .progress-bar-session {
                width: 100%;
                height: 6px;
                background: var(--bg-secondary);
                border-radius: 3px;
                margin: var(--spacing-md) 0;
                overflow: hidden;
            }
            
            .progress-fill-session {
                height: 100%;
                background: var(--primary-gradient);
                transition: width 0.3s ease;
            }
            
            @media (max-width: 768px) {
                .session-options {
                    grid-template-columns: 1fr;
                }
                
                .mindfulness-container {
                    width: 95%;
                    margin: var(--spacing-sm);
                }
                
                .session-timer {
                    font-size: 3rem;
                }
                
                .breathing-circle {
                    width: 150px;
                    height: 150px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    close() {
        const modal = document.getElementById('mindfulness-modal');
        if (modal) {
            modal.remove();
        }
        document.body.style.overflow = 'auto';
        
        // Stop any running sessions
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    startBreathingExercise() {
        const content = document.getElementById('mindfulness-session-content');
        content.innerHTML = `
            <div class="session-active">
                <h3>🫁 4-7-8 Breathing Exercise</h3>
                <p>This technique helps activate your body's relaxation response</p>
                
                <div class="breathing-circle" id="breathing-circle">
                    <span id="breathing-text">Ready?</span>
                </div>
                
                <div class="session-instruction" id="breathing-instruction">
                    Click "Start" to begin your breathing session
                </div>
                
                <div class="progress-bar-session">
                    <div class="progress-fill-session" id="breathing-progress" style="width: 0%"></div>
                </div>
                
                <div class="session-controls">
                    <button class="control-btn btn-primary" onclick="mindfulnessModal.runBreathingSession()" id="breathing-start">
                        <i class="fas fa-play"></i> Start Session
                    </button>
                    <button class="control-btn btn-secondary" onclick="mindfulnessModal.create()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                </div>
            </div>
        `;
    }

    runBreathingSession() {
        const circle = document.getElementById('breathing-circle');
        const text = document.getElementById('breathing-text');
        const instruction = document.getElementById('breathing-instruction');
        const progress = document.getElementById('breathing-progress');
        const startBtn = document.getElementById('breathing-start');
        
        startBtn.style.display = 'none';
        
        let cycle = 0;
        const totalCycles = 4;
        let phase = 0; // 0: inhale, 1: hold, 2: exhale, 3: pause
        
        const phases = [
            { name: 'Inhale', duration: 4000, class: 'inhale', text: 'Breathe In' },
            { name: 'Hold', duration: 7000, class: 'inhale', text: 'Hold' },
            { name: 'Exhale', duration: 8000, class: 'exhale', text: 'Breathe Out' },
            { name: 'Pause', duration: 2000, class: '', text: 'Rest' }
        ];
        
        const nextPhase = () => {
            if (cycle >= totalCycles) {
                // Session complete
                text.textContent = 'Complete!';
                instruction.textContent = 'Well done! You\'ve completed your breathing session. Notice how you feel now.';
                circle.className = 'breathing-circle';
                progress.style.width = '100%';
                
                setTimeout(() => {
                    startBtn.innerHTML = '<i class="fas fa-redo"></i> Repeat Session';
                    startBtn.style.display = 'inline-flex';
                }, 2000);
                return;
            }
            
            const currentPhase = phases[phase];
            text.textContent = currentPhase.text;
            instruction.textContent = `${currentPhase.name} for ${currentPhase.duration / 1000} seconds`;
            
            circle.className = `breathing-circle ${currentPhase.class}`;
            
            // Update progress
            const totalPhases = totalCycles * phases.length;
            const currentProgress = (cycle * phases.length + phase + 1) / totalPhases * 100;
            progress.style.width = `${currentProgress}%`;
            
            setTimeout(() => {
                phase++;
                if (phase >= phases.length) {
                    phase = 0;
                    cycle++;
                }
                nextPhase();
            }, currentPhase.duration);
        };
        
        // Start the session
        instruction.textContent = 'Get comfortable and follow the breathing guide';
        setTimeout(nextPhase, 1000);
    }

    startBodyScan() {
        // Implementation similar to breathing exercise but for body scan
        const content = document.getElementById('mindfulness-session-content');
        content.innerHTML = `
            <div class="session-active">
                <h3>🧘‍♀️ Progressive Body Scan</h3>
                <p>Systematically relax each part of your body</p>
                
                <div class="session-timer" id="bodyscan-timer">10:00</div>
                
                <div class="session-instruction" id="bodyscan-instruction">
                    Find a comfortable position, close your eyes, and focus on your breath
                </div>
                
                <div class="progress-bar-session">
                    <div class="progress-fill-session" id="bodyscan-progress" style="width: 0%"></div>
                </div>
                
                <div class="session-controls">
                    <button class="control-btn btn-primary" onclick="mindfulnessModal.runBodyScanSession()" id="bodyscan-start">
                        <i class="fas fa-play"></i> Start Session
                    </button>
                    <button class="control-btn btn-secondary" onclick="mindfulnessModal.create()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                </div>
            </div>
        `;
    }

    runBodyScanSession() {
        // Body scan implementation with guided steps
        console.log('Body scan session started');
    }

    startGroundingExercise() {
        const content = document.getElementById('mindfulness-session-content');
        content.innerHTML = `
            <div class="session-active">
                <h3>🌱 5-4-3-2-1 Grounding Exercise</h3>
                <p>Connect with your senses to anchor yourself in the present moment</p>
                
                <div class="session-instruction" id="grounding-instruction">
                    This exercise helps you focus on the present moment using your five senses
                </div>
                
                <div class="progress-bar-session">
                    <div class="progress-fill-session" id="grounding-progress" style="width: 0%"></div>
                </div>
                
                <div class="session-controls">
                    <button class="control-btn btn-primary" onclick="mindfulnessModal.runGroundingSession()" id="grounding-start">
                        <i class="fas fa-play"></i> Start Exercise
                    </button>
                    <button class="control-btn btn-secondary" onclick="mindfulnessModal.create()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                </div>
            </div>
        `;
    }

    runGroundingSession() {
        // Grounding exercise implementation
        console.log('Grounding session started');
    }

    startLovingKindness() {
        const content = document.getElementById('mindfulness-session-content');
        content.innerHTML = `
            <div class="session-active">
                <h3>💝 Loving Kindness Meditation</h3>
                <p>Cultivate compassion and goodwill for yourself and others</p>
                
                <div class="session-timer" id="loving-timer">8:00</div>
                
                <div class="session-instruction" id="loving-instruction">
                    Get comfortable and prepare to send loving thoughts
                </div>
                
                <div class="progress-bar-session">
                    <div class="progress-fill-session" id="loving-progress" style="width: 0%"></div>
                </div>
                
                <div class="session-controls">
                    <button class="control-btn btn-primary" onclick="mindfulnessModal.runLovingKindnessSession()" id="loving-start">
                        <i class="fas fa-play"></i> Start Meditation
                    </button>
                    <button class="control-btn btn-secondary" onclick="mindfulnessModal.create()">
                        <i class="fas fa-arrow-left"></i> Back
                    </button>
                </div>
            </div>
        `;
    }

    runLovingKindnessSession() {
        // Loving kindness meditation implementation
        console.log('Loving kindness session started');
    }
}

// Create global instance
window.mindfulnessModal = new MindfulnessModal();

// Global function for starting mindfulness
function startMindfulness() {
    window.mindfulnessModal.create();
}

// Export for use
window.MindfulnessModal = MindfulnessModal;
window.startMindfulness = startMindfulness;
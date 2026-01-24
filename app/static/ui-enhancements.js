/**
 * YuVA Wellness - UI Enhancement Scripts
 * Modern interactions and animations
 */

class UIEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.setupParallaxEffects();
        this.setupSmoothScrolling();
        this.setupInteractiveElements();
        this.setupLoadingStates();
        this.setupThemeTransitions();
        this.setupAccessibility();
    }

    setupParallaxEffects() {
        // Subtle parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-section');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    setupSmoothScrolling() {
        // Enhanced smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupInteractiveElements() {
        // Add ripple effect to buttons
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', this.createRipple);
        });

        // Add hover effects to cards
        document.querySelectorAll('.card, .feature-card, .stat-card').forEach(card => {
            card.addEventListener('mouseenter', this.addHoverGlow);
            card.addEventListener('mouseleave', this.removeHoverGlow);
        });

        // Add magnetic effect to important buttons
        document.querySelectorAll('.hero-btn').forEach(button => {
            button.addEventListener('mousemove', this.magneticEffect);
            button.addEventListener('mouseleave', this.resetMagnetic);
        });
    }

    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        // Add ripple styles
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple-animation 0.6s linear';
        ripple.style.pointerEvents = 'none';

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        // Add CSS animation if not exists
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addHoverGlow(event) {
        const element = event.currentTarget;
        element.style.transition = 'all 0.3s ease';
        element.style.filter = 'brightness(1.1)';
    }

    removeHoverGlow(event) {
        const element = event.currentTarget;
        element.style.filter = 'brightness(1)';
    }

    magneticEffect(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        
        const moveX = x * 0.1;
        const moveY = y * 0.1;
        
        button.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    resetMagnetic(event) {
        const button = event.currentTarget;
        button.style.transform = 'translate(0, 0)';
    }

    setupLoadingStates() {
        // Add loading states to forms and buttons
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', function(e) {
                const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
                if (submitBtn) {
                    submitBtn.classList.add('loading');
                    submitBtn.disabled = true;
                    
                    // Reset after 3 seconds if no response
                    setTimeout(() => {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                    }, 3000);
                }
            });
        });
    }

    setupThemeTransitions() {
        // Smooth theme transitions
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.style.transition = 'all 0.3s ease';
                setTimeout(() => {
                    document.body.style.transition = '';
                }, 300);
            });
        }
    }

    setupAccessibility() {
        // Keyboard navigation enhancements
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Add focus styles for keyboard navigation
        if (!document.querySelector('#accessibility-styles')) {
            const style = document.createElement('style');
            style.id = 'accessibility-styles';
            style.textContent = `
                .keyboard-navigation *:focus {
                    outline: 2px solid var(--primary) !important;
                    outline-offset: 2px !important;
                }
                
                .keyboard-navigation button:focus,
                .keyboard-navigation a:focus {
                    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.3) !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Utility methods
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            color: var(--text-primary);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    static createLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner-ring"></div>
            <div class="spinner-text">Loading...</div>
        `;
        
        spinner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(15, 15, 35, 0.9);
            backdrop-filter: blur(10px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: var(--text-primary);
        `;

        // Add spinner styles
        if (!document.querySelector('#spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'spinner-styles';
            style.textContent = `
                .spinner-ring {
                    width: 60px;
                    height: 60px;
                    border: 4px solid var(--border-color);
                    border-top: 4px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }
                
                .spinner-text {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        return spinner;
    }
}

// Initialize UI enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UIEnhancements();
});

// Export for use in other scripts
window.UIEnhancements = UIEnhancements;
/**
 * YuVA Wellness - Home Page Component
 * Handles home page interactions and header positioning
 */

class HomePage {
    constructor() {
        this.init();
    }

    init() {
        this.setupHeaderFixed();
        this.setupScrollAnimations();
        this.setupInteractiveElements();
    }

    setupHeaderFixed() {
        // Force header to be fixed and remove gaps
        const header = document.querySelector('header');
        if (header) {
            header.style.position = 'fixed';
            header.style.top = '0';
            header.style.left = '0';
            header.style.right = '0';
            header.style.zIndex = '1000';
            
            // Add padding to body to compensate for fixed header
            const headerHeight = header.offsetHeight;
            document.body.style.paddingTop = headerHeight + 'px';
        }
    }

    setupScrollAnimations() {
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Intersection Observer for fade-in animations
        this.setupIntersectionObserver();
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements that should animate in
        document.querySelectorAll('.card, .feature-card, .hero-section').forEach(el => {
            observer.observe(el);
        });
    }

    setupInteractiveElements() {
        // Add hover effects to cards
        document.querySelectorAll('.card, .feature-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });

        // Add click tracking for analytics (optional)
        this.setupClickTracking();
    }

    setupClickTracking() {
        // Track clicks on main navigation buttons
        document.querySelectorAll('.nav-btn, .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.textContent.trim();
                const href = btn.getAttribute('href');
                
                // Log interaction (could be sent to analytics service)
                console.log('User interaction:', {
                    action,
                    href,
                    timestamp: new Date().toISOString()
                });
            });
        });
    }

    // Method to highlight active navigation item
    updateActiveNavigation() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '/' && href === '/')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Method to show welcome message for new users
    showWelcomeMessage() {
        const isFirstVisit = !localStorage.getItem('yuva-visited');
        
        if (isFirstVisit) {
            localStorage.setItem('yuva-visited', 'true');
            
            // Show welcome toast
            this.showToast('Welcome to YuVA Wellness! 🌟 Your mental health journey starts here.', 'success', 5000);
        }
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add toast styles if not present
        if (!document.querySelector('#toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    z-index: 1001;
                    max-width: 400px;
                    padding: 1rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    animation: slideInRight 0.3s ease-out;
                }
                .toast-success { background: var(--success); color: white; }
                .toast-info { background: var(--primary); color: white; }
                .toast-warning { background: var(--warning); color: var(--text-primary); }
                .toast-error { background: var(--danger); color: white; }
                .toast-content { display: flex; justify-content: space-between; align-items: center; }
                .toast-close { background: none; border: none; color: inherit; cursor: pointer; }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(toast);
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, duration);
        }
    }

    // Method to handle responsive navigation
    handleResponsiveNav() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                mobileToggle.classList.toggle('active');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                    mobileMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                }
            });
        }
    }
}

// Global functions for backward compatibility
let homePage;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    homePage = new HomePage();
    
    // Show welcome message for new users
    setTimeout(() => {
        homePage.showWelcomeMessage();
    }, 1000);
    
    // Update active navigation
    homePage.updateActiveNavigation();
    
    // Setup responsive navigation
    homePage.handleResponsiveNav();
});

// Export for use in other components
window.HomePage = HomePage;
/**
 * YuVA Wellness - Navigation Component
 * Handles navigation interactions and mobile menu
 */

class NavigationComponent {
    constructor() {
        this.mobileMenuOpen = false;
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupActiveLinks();
        this.setupScrollBehavior();
    }

    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        if (mobileMenu) {
            mobileMenu.classList.toggle('active', this.mobileMenuOpen);
        }
        
        if (mobileToggle) {
            mobileToggle.classList.toggle('active', this.mobileMenuOpen);
        }
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : 'auto';
    }

    closeMobileMenu() {
        if (this.mobileMenuOpen) {
            this.toggleMobileMenu();
        }
    }

    setupActiveLinks() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath || (currentPath === '/' && href === '/')) {
                link.classList.add('active');
            }
        });
    }

    setupScrollBehavior() {
        const navbar = document.querySelector('.navbar');
        let lastScrollY = window.scrollY;
        
        if (navbar) {
            window.addEventListener('scroll', () => {
                const currentScrollY = window.scrollY;
                
                // Add shadow when scrolled
                if (currentScrollY > 10) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                
                // Hide/show navbar on scroll (optional)
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    navbar.classList.add('hidden');
                } else {
                    navbar.classList.remove('hidden');
                }
                
                lastScrollY = currentScrollY;
            });
        }
    }

    // Public method to highlight active section
    setActiveSection(sectionId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationComponent = new NavigationComponent();
});

// Export for use in other components
window.NavigationComponent = NavigationComponent;
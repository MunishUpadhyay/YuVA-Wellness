/**
 * YuVA Wellness - Theme Manager Component
 * Handles theme switching and header scroll behavior
 */

class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadSavedTheme();
        this.setupScrollListener();
        this.setupThemeToggle();
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
        const themeToggle = document.querySelector('.theme-toggle i');
        
        // Remove light theme class first
        document.body.classList.remove('light-theme');
        
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            if (themeToggle) {
                themeToggle.className = 'fas fa-sun';
            }
        } else {
            // Dark theme is default, no class needed
            if (themeToggle) {
                themeToggle.className = 'fas fa-moon';
            }
        }
    }

    setupThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        const body = document.body;
        const themeToggle = document.querySelector('.theme-toggle i');
        
        if (body.classList.contains('light-theme')) {
            // Switch to dark theme
            body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
            if (themeToggle) {
                themeToggle.className = 'fas fa-moon';
            }
        } else {
            // Switch to light theme
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            if (themeToggle) {
                themeToggle.className = 'fas fa-sun';
            }
        }
    }

    setupScrollListener() {
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            this.handleHeaderScroll();
        });
    }

    handleHeaderScroll() {
        const header = document.querySelector('header');
        if (!header) return;
        
        const scrolled = window.scrollY > 50;
        
        if (scrolled) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // Method to programmatically set theme
    setTheme(theme) {
        const body = document.body;
        const themeToggle = document.querySelector('.theme-toggle i');
        
        // Remove light theme class first
        body.classList.remove('light-theme');
        
        if (theme === 'light') {
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            if (themeToggle) {
                themeToggle.className = 'fas fa-sun';
            }
        } else {
            // Dark theme is default, no class needed
            localStorage.setItem('theme', 'dark');
            if (themeToggle) {
                themeToggle.className = 'fas fa-moon';
            }
        }
    }

    // Get current theme
    getCurrentTheme() {
        return document.body.classList.contains('light-theme') ? 'light' : 'dark';
    }
}

// Global functions for backward compatibility
let themeManager;

function toggleTheme() {
    if (themeManager) {
        themeManager.toggleTheme();
    }
}

function handleHeaderScroll() {
    if (themeManager) {
        themeManager.handleHeaderScroll();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
});

// Export for use in other components
window.ThemeManager = ThemeManager;
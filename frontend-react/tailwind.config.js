import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                border: "rgb(var(--border) / <alpha-value>)", // Ensure fallback or define in CSS if needed, or use white/10
                input: "rgb(var(--input) / <alpha-value>)",
                ring: "rgb(var(--ring) / <alpha-value>)",
                background: "rgb(var(--background) / <alpha-value>)",
                foreground: "rgb(var(--foreground) / <alpha-value>)",
                surface: {
                    DEFAULT: "rgb(var(--surface) / <alpha-value>)",
                    highlight: "rgb(var(--surface-highlight) / <alpha-value>)",
                },
                primary: {
                    DEFAULT: "rgb(var(--primary) / <alpha-value>)",
                    hover: "rgb(var(--primary-hover) / <alpha-value>)",
                    foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
                },
                secondary: {
                    DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
                    hover: "rgb(var(--secondary-hover) / <alpha-value>)",
                    foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
                },
                accent: {
                    violet: "rgb(var(--accent-violet) / <alpha-value>)",
                    fuchsia: "rgb(var(--accent-fuchsia) / <alpha-value>)",
                    cyan: "rgb(var(--accent-cyan) / <alpha-value>)",
                    emerald: "rgb(var(--accent-emerald) / <alpha-value>)",
                    teal: "rgb(var(--accent-teal) / <alpha-value>)",
                    amber: "rgb(var(--accent-amber) / <alpha-value>)",
                    rose: "rgb(var(--accent-rose) / <alpha-value>)",
                },
                // Keep compatible with old theme if needed, or map to new
                wellness: {
                    DEFAULT: "rgb(var(--accent-teal) / <alpha-value>)",
                    400: "rgb(var(--accent-cyan) / <alpha-value>)",
                    500: "rgb(var(--accent-teal) / <alpha-value>)",
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.4s ease-out',
                'pulse-slow': 'pulse 3s infinite',
                'float': 'float 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                glow: {
                    'from': { boxShadow: '0 0 10px -10px #6366f1' },
                    'to': { boxShadow: '0 0 20px 5px #6366f1' }
                }
            },
            backgroundImage: {
                'gradient-cosmic': 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                'gradient-glass': 'linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
            }
        },
    },
    plugins: [
        function ({ addUtilities }) {
            addUtilities({
                '.scrollbar-hide': {
                    /* IE and Edge */
                    '-ms-overflow-style': 'none',
                    /* Firefox */
                    'scrollbar-width': 'none',
                    /* Safari and Chrome */
                    '&::-webkit-scrollbar': {
                        display: 'none'
                    }
                }
            })
        },
        typography,
    ],
}

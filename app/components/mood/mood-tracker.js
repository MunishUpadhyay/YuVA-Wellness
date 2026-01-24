/**
 * YuVA Wellness - Mood Tracker Component
 * Handles mood logging, statistics, and calendar visualization
 */

class MoodTracker {
    constructor() {
        this.moodEntries = [];
        this.init();
    }

    async init() {
        await this.loadMoodData();
        this.renderStats();
        this.renderMoodGrid();
        this.setupEventListeners();
    }

    async loadMoodData() {
        try {
            const response = await fetch('/api/mood/entries');
            if (response.ok) {
                this.moodEntries = await response.json();
            }
        } catch (error) {
            console.error('Error loading mood data:', error);
            this.moodEntries = [];
        }
    }

    renderStats() {
        if (this.moodEntries.length === 0) {
            document.getElementById('totalEntries').textContent = '0';
            document.getElementById('currentStreak').textContent = '0';
            document.getElementById('averageMood').textContent = 'N/A';
            document.getElementById('mostCommon').textContent = 'N/A';
            return;
        }

        // Calculate statistics
        const total = this.moodEntries.length;
        const moodCounts = {};
        let totalScore = 0;
        const moodScores = { '😊': 5, '😐': 3, '😔': 2, '😫': 1, '🥰': 5, '😴': 2, '😰': 1, '😡': 1, '🤔': 3 };

        this.moodEntries.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
            totalScore += moodScores[entry.mood] || 3;
        });

        const averageScore = (totalScore / total).toFixed(1);
        const mostCommonMood = Object.keys(moodCounts).reduce((a, b) => 
            moodCounts[a] > moodCounts[b] ? a : b
        );

        // Calculate streak
        const streak = this.calculateStreak();

        // Update DOM
        document.getElementById('totalEntries').textContent = total;
        document.getElementById('currentStreak').textContent = streak;
        document.getElementById('averageMood').textContent = `${averageScore}/5`;
        document.getElementById('mostCommon').textContent = mostCommonMood;
    }

    calculateStreak() {
        if (this.moodEntries.length === 0) return 0;

        const today = new Date();
        let streak = 0;
        let currentDate = new Date(today);

        // Sort entries by date (newest first)
        const sortedEntries = [...this.moodEntries].sort((a, b) => 
            new Date(b.logged_date) - new Date(a.logged_date)
        );

        for (let i = 0; i < 30; i++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const hasEntry = sortedEntries.some(entry => 
                entry.logged_date === dateStr
            );

            if (hasEntry) {
                streak++;
            } else if (i > 0) {
                break;
            }

            currentDate.setDate(currentDate.getDate() - 1);
        }

        return streak;
    }

    renderMoodGrid() {
        const grid = document.getElementById('moodGrid');
        if (!grid) return;
        
        grid.innerHTML = '';

        // Create 30-day grid
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            const dateStr = date.toISOString().split('T')[0];
            const entry = this.moodEntries.find(e => e.logged_date === dateStr);
            
            const cell = document.createElement('div');
            cell.className = 'mood-cell';
            cell.title = `${date.toLocaleDateString()} - ${entry ? entry.mood : 'No entry'}`;
            
            if (entry) {
                cell.textContent = entry.mood;
                cell.classList.add('has-entry');
                if (entry.note) {
                    cell.title += ` - ${entry.note}`;
                }
            } else {
                cell.classList.add('no-entry');
            }
            
            grid.appendChild(cell);
        }
    }

    setupEventListeners() {
        // Mood buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mood = e.target.textContent.trim();
                this.logMood(mood);
            });
        });

        // Clear note button
        const clearBtn = document.getElementById('clearNote');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                document.getElementById('moodNote').value = '';
            });
        }
    }

    async logMood(mood) {
        const note = document.getElementById('moodNote').value;
        
        try {
            const response = await fetch('/api/mood/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mood: mood,
                    note: note
                })
            });

            if (response.ok) {
                this.showMessage('Mood logged successfully! 🎉', 'success');
                document.getElementById('moodNote').value = '';
                
                // Refresh data
                await this.loadMoodData();
                this.renderStats();
                this.renderMoodGrid();
            } else {
                throw new Error('Failed to log mood');
            }
        } catch (error) {
            console.error('Error logging mood:', error);
            this.showMessage('Failed to log mood. Please try again.', 'error');
        }
    }

    showMessage(message, type) {
        const messageDiv = document.getElementById('moodMessage');
        if (!messageDiv) return;
        
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// Global functions for backward compatibility
let moodTracker;

async function logMood(mood) {
    if (moodTracker) {
        await moodTracker.logMood(mood);
    }
}

function showMessage(message, type) {
    if (moodTracker) {
        moodTracker.showMessage(message, type);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    moodTracker = new MoodTracker();
});

// Export for use in other components
window.MoodTracker = MoodTracker;
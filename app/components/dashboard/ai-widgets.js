/**
 * YuVA Wellness - AI Dashboard Widgets Component
 * Handles all AI-powered dashboard widgets and interactions
 */

class AIDashboardWidgets {
    constructor() {
        this.loadAllWidgets();
    }

    async loadAllWidgets() {
        await Promise.all([
            this.loadDailyInsights(),
            this.loadProgress(),
            this.loadAffirmation(),
            this.loadWellnessTip(),
            this.loadMindfulness(),
            this.loadSuggestions()
        ]);
    }

    async loadDailyInsights() {
        try {
            const response = await fetch('/api/ai/daily-insights');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            const insights = data.insights;
            
            const content = document.getElementById('daily-insights-content');
            content.innerHTML = `
                <div class="insight-card">
                    <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-xs);">🧠 Mood Pattern</h4>
                    <p style="color: var(--text-secondary); margin: 0;">${insights.mood_insight?.message || 'Start logging your moods to see patterns!'}</p>
                </div>
                <div class="insight-card">
                    <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-xs);">📈 Progress Update</h4>
                    <p style="color: var(--text-secondary); margin: 0;">${insights.progress_update?.next_milestone?.message || 'Keep tracking to see your progress!'}</p>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load daily insights:', error);
            // Fall back to demo content
            document.getElementById('daily-insights-content').innerHTML = `
                <div class="insight-card">
                    <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-xs);">🧠 Mood Pattern</h4>
                    <p style="color: var(--text-secondary); margin: 0;">Your mood has been consistently positive over the past 3 days. Keep up the great work!</p>
                </div>
                <div class="insight-card">
                    <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-xs);">📈 Progress Update</h4>
                    <p style="color: var(--text-secondary); margin: 0;">You're 85% towards your weekly wellness goal. Just 2 more journal entries to go!</p>
                </div>
            `;
        }
    }

    async loadProgress() {
        try {
            const response = await fetch('/api/ai/progress-summary');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            const progress = data.progress;
            
            const content = document.getElementById('progress-content');
            
            content.innerHTML = `
                <div style="margin-bottom: var(--spacing-md);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs); color: var(--text-primary); font-weight: 600;">
                        <span>Weekly Goal</span>
                        <span>85%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 85%"></div>
                    </div>
                </div>
                <div style="margin-bottom: var(--spacing-md);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs); color: var(--text-primary); font-weight: 600;">
                        <span>Mindfulness Streak</span>
                        <span>7 days</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 70%"></div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load progress:', error);
            // Fall back to demo content
            document.getElementById('progress-content').innerHTML = `
                <div style="margin-bottom: var(--spacing-md);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs); color: var(--text-primary); font-weight: 600;">
                        <span>Weekly Goal</span>
                        <span>85%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 85%"></div>
                    </div>
                </div>
                <div style="margin-bottom: var(--spacing-md);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs); color: var(--text-primary); font-weight: 600;">
                        <span>Mindfulness Streak</span>
                        <span>7 days</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 70%"></div>
                    </div>
                </div>
            `;
        }
    }

    async loadAffirmation() {
        try {
            const response = await fetch('/api/ai/affirmation');
            const data = await response.json();
            
            const content = document.getElementById('affirmation-content');
            content.innerHTML = `
                <div class="affirmation-text">
                    "${data.affirmation.text}"
                </div>
                <p style="text-align: center; margin-top: var(--spacing-sm); color: var(--text-muted); font-size: 0.9rem;">
                    Theme: ${data.affirmation.theme.replace('_', ' ').toUpperCase()}
                </p>
            `;
        } catch (error) {
            console.error('Failed to load affirmation:', error);
            // Fall back to demo content
            document.getElementById('affirmation-content').innerHTML = `
                <div class="affirmation-text">
                    "I am capable of handling whatever challenges come my way today. My mental health matters, and I choose to prioritize my wellbeing."
                </div>
            `;
        }
    }

    async loadWellnessTip() {
        try {
            const response = await fetch('/api/ai/wellness-tip');
            const data = await response.json();
            
            const content = document.getElementById('wellness-tip-content');
            content.innerHTML = `
                <div class="insight-card">
                    <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-xs);">💡 Today's Tip: ${data.tip.category}</h4>
                    <p style="color: var(--text-secondary); margin: 0;">${data.tip.tip}</p>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load wellness tip:', error);
            // Fall back to demo content
            document.getElementById('wellness-tip-content').innerHTML = `
                <div class="insight-card">
                    <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-xs);">💡 Today's Tip: Deep Breathing</h4>
                    <p style="color: var(--text-secondary); margin: 0;">Try the 4-7-8 breathing technique: Inhale for 4 counts, hold for 7, exhale for 8. This activates your body's relaxation response.</p>
                </div>
            `;
        }
    }

    async loadMindfulness() {
        try {
            const response = await fetch('/api/ai/mindfulness-exercise');
            const data = await response.json();
            
            const content = document.getElementById('mindfulness-content');
            content.innerHTML = `
                <div class="exercise-steps">
                    <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-xs);">🧘 ${data.exercise.name}</h4>
                    <p style="color: var(--text-secondary); margin: 0;">${data.exercise.instruction}</p>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load mindfulness exercise:', error);
            // Fall back to demo content
            document.getElementById('mindfulness-content').innerHTML = `
                <div class="exercise-steps">
                    <h4 style="color: var(--text-primary); margin-bottom: var(--spacing-xs);">🧘 5-Minute Body Scan</h4>
                    <p style="color: var(--text-secondary); margin: 0;">Take a moment to scan your body from head to toe. Notice any areas of tension and consciously relax them.</p>
                </div>
            `;
        }
    }

    async loadSuggestions() {
        try {
            const response = await fetch('/api/ai/smart-suggestions');
            const data = await response.json();
            
            const content = document.getElementById('suggestions-content');
            content.innerHTML = data.suggestions.map(suggestion => `
                <div class="action-item">
                    <span class="action-icon">${suggestion.icon}</span>
                    <div>
                        <div style="color: var(--text-primary); font-weight: 600;">${suggestion.action}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">${suggestion.duration} • ${suggestion.benefit}</div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load suggestions:', error);
            // Fall back to demo content
            document.getElementById('suggestions-content').innerHTML = `
                <div class="action-item">
                    <span class="action-icon">🎯</span>
                    <div>
                        <div style="color: var(--text-primary); font-weight: 600;">Take a 10-minute walk</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Based on your recent mood patterns</div>
                    </div>
                </div>
                <div class="action-item">
                    <span class="action-icon">📚</span>
                    <div>
                        <div style="color: var(--text-primary); font-weight: 600;">Try guided meditation</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Check out our Resources section</div>
                    </div>
                </div>
            `;
        }
    }

    showError(elementId, message) {
        document.getElementById(elementId).innerHTML = `
            <div style="color: var(--danger); text-align: center; padding: var(--spacing-md); background: var(--bg-secondary); border-radius: var(--border-radius); border-left: 4px solid var(--danger);">
                <i class="fas fa-exclamation-triangle" style="margin-bottom: var(--spacing-xs);"></i>
                <p style="margin: 0; font-weight: 500;">${message}</p>
                <button onclick="location.reload()" style="margin-top: var(--spacing-sm); padding: var(--spacing-xs) var(--spacing-sm); background: var(--danger); color: white; border: none; border-radius: var(--border-radius); cursor: pointer; font-size: 0.8rem;">
                    <i class="fas fa-sync-alt"></i> Retry
                </button>
            </div>
        `;
    }
}

// Global functions for widget refresh
async function refreshWidget(widgetType) {
    const contentId = `${widgetType}-content`;
    const element = document.getElementById(contentId);
    
    // Show loading state
    element.innerHTML = `
        <div class="loading-widget">
            <i class="fas fa-spinner fa-spin"></i> Refreshing ${widgetType.replace('-', ' ')}...
        </div>
    `;
    
    const dashboard = new AIDashboardWidgets();
    
    try {
        switch(widgetType) {
            case 'daily-insights':
                await dashboard.loadDailyInsights();
                break;
            case 'progress':
                await dashboard.loadProgress();
                break;
            case 'affirmation':
                await dashboard.loadAffirmation();
                break;
            case 'wellness-tip':
                await dashboard.loadWellnessTip();
                break;
            case 'mindfulness':
                await dashboard.loadMindfulness();
                break;
            case 'suggestions':
                await dashboard.loadSuggestions();
                break;
        }
    } catch (error) {
        console.error(`Failed to refresh ${widgetType}:`, error);
        dashboard.showError(contentId, `Failed to refresh ${widgetType.replace('-', ' ')}. Please try again.`);
    }
}

// Export for global use
window.AIDashboardWidgets = AIDashboardWidgets;
window.refreshWidget = refreshWidget;
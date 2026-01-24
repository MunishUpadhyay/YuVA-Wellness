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
                    <h4>🧠 Mood Pattern</h4>
                    <p>${insights.mood_insight?.message || 'Start logging your moods to see patterns!'}</p>
                    <small style="color: var(--text-muted);">
                        💡 ${insights.mood_insight?.recommendation || 'Log your mood daily for better insights.'}
                    </small>
                </div>
                <div class="insight-card">
                    <h4>📈 Progress Update</h4>
                    <p>${insights.progress_update?.next_milestone?.message || 'Keep tracking to see your progress!'}</p>
                </div>
                <div class="insight-card">
                    <h4>💡 Today's Tip</h4>
                    <p><strong>${insights.wellness_tip?.category || 'Wellness'}:</strong> ${insights.wellness_tip?.tip || 'Take care of yourself today.'}</p>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load daily insights:', error);
            this.showError('daily-insights-content', 'Unable to load insights. Please try refreshing.');
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
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
                        <span>📊 Mood Logs</span>
                        <span><strong>${progress.total_mood_logs || 0}</strong></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
                        <span>📝 Journal Entries</span>
                        <span><strong>${progress.total_journal_entries || 0}</strong></span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
                        <span>🔥 Current Streak</span>
                        <span><strong>${progress.current_streak || 0} days</strong></span>
                    </div>
                </div>
                
                ${progress.achievements && progress.achievements.length > 0 ? `
                    <div>
                        <h4 style="margin-bottom: var(--spacing-sm);">🏆 Achievements</h4>
                        ${progress.achievements.map(achievement => `
                            <div class="action-item">
                                <span class="action-icon">✨</span>
                                <span>${achievement}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: var(--spacing-md); color: var(--text-muted);">
                        <p>🎯 Start your wellness journey!</p>
                        <p style="font-size: 0.9rem;">${progress.next_milestone?.message || 'Log your first mood or journal entry to begin tracking progress.'}</p>
                    </div>
                `}
                
                ${progress.next_milestone ? `
                    <div style="margin-top: var(--spacing-md); padding: var(--spacing-sm); background: var(--bg-secondary); border-radius: var(--border-radius);">
                        <h5 style="margin: 0 0 var(--spacing-xs) 0; color: var(--primary);">🎯 Next Milestone</h5>
                        <p style="margin: 0; font-size: 0.9rem;">${progress.next_milestone.message}</p>
                        ${progress.next_milestone.remaining ? `
                            <div class="progress-bar" style="margin-top: var(--spacing-xs);">
                                <div class="progress-fill" style="width: ${Math.max(10, (progress.next_milestone.current / progress.next_milestone.target) * 100)}%"></div>
                            </div>
                            <p style="margin: var(--spacing-xs) 0 0 0; font-size: 0.8rem; color: var(--text-muted);">
                                ${progress.next_milestone.current}/${progress.next_milestone.target} (${progress.next_milestone.remaining} to go)
                            </p>
                        ` : ''}
                    </div>
                ` : ''}
            `;
        } catch (error) {
            console.error('Failed to load progress:', error);
            this.showError('progress-content', 'Unable to load progress data. Please try refreshing.');
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
            this.showError('affirmation-content', 'Failed to load affirmation');
        }
    }

    async loadWellnessTip() {
        try {
            const response = await fetch('/api/ai/wellness-tip');
            const data = await response.json();
            
            const content = document.getElementById('wellness-tip-content');
            content.innerHTML = `
                <div style="margin-bottom: var(--spacing-md);">
                    <h4 style="color: var(--primary); margin-bottom: var(--spacing-sm);">
                        ${data.tip.category}
                    </h4>
                    <p>${data.tip.tip}</p>
                </div>
                <div style="display: flex; align-items: center; gap: var(--spacing-sm); color: var(--text-muted); font-size: 0.9rem;">
                    <i class="fas fa-clock"></i>
                    <span>Difficulty: ${data.tip.difficulty}</span>
                </div>
            `;
        } catch (error) {
            this.showError('wellness-tip-content', 'Failed to load wellness tip');
        }
    }

    async loadMindfulness() {
        try {
            const response = await fetch('/api/ai/mindfulness-exercise');
            const data = await response.json();
            
            const content = document.getElementById('mindfulness-content');
            content.innerHTML = `
                <div>
                    <h4 style="color: var(--primary); margin-bottom: var(--spacing-sm);">
                        ${data.exercise.name}
                    </h4>
                    <div class="exercise-steps">
                        <p>${data.exercise.instruction}</p>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: var(--spacing-sm); font-size: 0.9rem; color: var(--text-muted);">
                        <span><i class="fas fa-clock"></i> ${data.exercise.duration}</span>
                        <span><i class="fas fa-heart"></i> ${data.exercise.benefit}</span>
                    </div>
                </div>
            `;
        } catch (error) {
            this.showError('mindfulness-content', 'Failed to load mindfulness exercise');
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
                    <div style="flex: 1;">
                        <div style="font-weight: 500;">${suggestion.action}</div>
                        <div style="font-size: 0.9rem; color: var(--text-muted);">
                            ${suggestion.duration} • ${suggestion.benefit}
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            this.showError('suggestions-content', 'Failed to load suggestions');
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
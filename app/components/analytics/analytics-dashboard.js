/**
 * YuVA Wellness - Analytics Dashboard Component
 * Handles wellness analytics loading and visualization
 */

class AnalyticsDashboard {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        // Load analytics with a slight delay for better UX
        setTimeout(() => {
            this.loadAnalytics();
        }, 500);
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.querySelector('button[onclick="refreshAnalytics()"]');
        if (refreshBtn) {
            refreshBtn.onclick = () => this.refreshAnalytics();
        }

        // Keyboard shortcut for refresh (Ctrl+R or F5)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey && e.key === 'r') || e.key === 'F5') {
                e.preventDefault();
                this.refreshAnalytics();
            }
        });
    }

    async loadAnalytics() {
        try {
            // Load risk assessment
            await this.loadRiskAssessment();
            
            // Load mood trends
            await this.loadMoodTrends();
            
            // Load patterns
            await this.loadPatterns();
            
            // Load recommendations
            await this.loadRecommendations();
            
        } catch (error) {
            console.error('Error loading analytics:', error);
            this.showGlobalError();
        }
    }

    async loadRiskAssessment() {
        try {
            const response = await fetch('/api/analytics/risk-assessment');
            if (response.ok) {
                const riskData = await response.json();
                this.renderRiskAssessment(riskData);
            } else {
                throw new Error('Risk assessment unavailable');
            }
        } catch (error) {
            this.renderFallbackRiskAssessment();
        }
    }

    renderRiskAssessment(riskData) {
        const content = document.getElementById('riskContent');
        if (!content) return;

        content.innerHTML = `
            <div class="risk-level ${riskData.level.toLowerCase()}">
                <h4>Risk Level: ${riskData.level}</h4>
                <p>${riskData.message}</p>
                ${riskData.factors && riskData.factors.length > 0 ? 
                    `<ul>${riskData.factors.map(factor => `<li>${factor}</li>`).join('')}</ul>` : 
                    '<p style="color: var(--text-muted); font-style: italic;">No specific risk factors identified at this time.</p>'
                }
            </div>
        `;
    }

    renderFallbackRiskAssessment() {
        const content = document.getElementById('riskContent');
        if (!content) return;

        content.innerHTML = `
            <div class="risk-level low">
                <h4>Risk Assessment</h4>
                <p>Your wellness data is being analyzed. Start logging moods and journal entries to get personalized risk insights.</p>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: var(--spacing-md);">
                    <strong>Note:</strong> This assessment is for informational purposes only and should not replace professional medical advice.
                </p>
            </div>
        `;
    }

    async loadMoodTrends() {
        try {
            const response = await fetch('/api/analytics/mood-trends');
            if (response.ok) {
                const trendsData = await response.json();
                this.renderMoodTrends(trendsData);
            } else {
                throw new Error('Trends unavailable');
            }
        } catch (error) {
            this.renderFallbackMoodTrends();
        }
    }

    renderMoodTrends(trendsData) {
        const content = document.getElementById('trendsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="trend-item">
                <h4>Overall Trend: ${trendsData.overall_trend || 'Stable'}</h4>
                <p>${trendsData.description || 'Your mood patterns show consistency. Keep tracking to identify trends over time.'}</p>
                <div class="trend-chart">
                    <div class="trend-bar" style="width: ${trendsData.trend_percentage || 50}%"></div>
                </div>
                <p style="color: var(--text-muted); font-size: 0.9rem;">
                    Progress: ${trendsData.trend_percentage || 50}% positive trend
                </p>
            </div>
        `;
    }

    renderFallbackMoodTrends() {
        const content = document.getElementById('trendsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="trend-item">
                <h4>Mood Trends</h4>
                <p>Start logging your daily moods to see personalized trend analysis and insights.</p>
                <div class="trend-chart">
                    <div class="trend-bar" style="width: 0%"></div>
                </div>
                <p style="color: var(--text-muted); font-size: 0.9rem;">
                    Log at least 7 days of mood data to see meaningful trends.
                </p>
            </div>
        `;
    }

    async loadPatterns() {
        try {
            const response = await fetch('/api/analytics/patterns');
            if (response.ok) {
                const patternsData = await response.json();
                this.renderPatterns(patternsData);
            } else {
                throw new Error('Patterns unavailable');
            }
        } catch (error) {
            this.renderFallbackPatterns();
        }
    }

    renderPatterns(patternsData) {
        const content = document.getElementById('patternsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="pattern-item">
                <h4>Detected Patterns</h4>
                ${patternsData.patterns && patternsData.patterns.length > 0 ? 
                    `<ul>${patternsData.patterns.map(pattern => `<li>${pattern}</li>`).join('')}</ul>` :
                    '<p style="color: var(--text-muted);">No significant patterns detected yet. Continue tracking to identify behavioral and mood patterns.</p>'
                }
            </div>
        `;
    }

    renderFallbackPatterns() {
        const content = document.getElementById('patternsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="pattern-item">
                <h4>Detected Patterns</h4>
                <ul>
                    <li>Pattern detection requires consistent mood and journal logging</li>
                    <li>AI analysis improves with more data points over time</li>
                    <li>Weekly patterns often emerge after 2-3 weeks of tracking</li>
                    <li>Seasonal patterns may be detected after several months</li>
                </ul>
            </div>
        `;
    }

    async loadRecommendations() {
        try {
            const response = await fetch('/api/analytics/recommendations');
            if (response.ok) {
                const recommendationsData = await response.json();
                this.renderRecommendations(recommendationsData);
            } else {
                throw new Error('Recommendations unavailable');
            }
        } catch (error) {
            this.renderFallbackRecommendations();
        }
    }

    renderRecommendations(recommendationsData) {
        const content = document.getElementById('recommendationsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="recommendation-item">
                <h4>Personalized Recommendations</h4>
                ${recommendationsData.recommendations && recommendationsData.recommendations.length > 0 ? 
                    `<ul>${recommendationsData.recommendations.map(rec => `<li>${rec}</li>`).join('')}</ul>` :
                    '<ul><li>Continue daily mood tracking for personalized insights</li><li>Try the mindfulness exercises in the AI Dashboard</li><li>Use the chat feature to discuss your feelings</li><li>Set up a consistent journaling routine</li></ul>'
                }
            </div>
        `;
    }

    renderFallbackRecommendations() {
        const content = document.getElementById('recommendationsContent');
        if (!content) return;

        content.innerHTML = `
            <div class="recommendation-item">
                <h4>General Wellness Recommendations</h4>
                <ul>
                    <li>Practice daily mindfulness or meditation for 5-10 minutes</li>
                    <li>Maintain a consistent sleep schedule (7-9 hours per night)</li>
                    <li>Engage in regular physical activity, even light walking</li>
                    <li>Connect with friends, family, or support networks regularly</li>
                    <li>Limit caffeine and alcohol, especially before bedtime</li>
                    <li>Practice gratitude by noting 3 positive things daily</li>
                    <li>Seek professional help if you're struggling consistently</li>
                </ul>
            </div>
        `;
    }

    refreshAnalytics() {
        // Show loading states
        const sections = ['riskContent', 'trendsContent', 'patternsContent', 'recommendationsContent'];
        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) {
                element.innerHTML = '<div class="loading">Refreshing analytics...</div>';
            }
        });
        
        // Reload data
        setTimeout(() => {
            this.loadAnalytics();
        }, 1000);
    }

    showGlobalError() {
        // Show user-friendly error messages for each section
        const sections = ['riskContent', 'trendsContent', 'patternsContent', 'recommendationsContent'];
        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element && element.innerHTML.includes('loading')) {
                element.innerHTML = `
                    <div style="text-align: center; padding: var(--spacing-xl); color: var(--text-muted);">
                        <p>📊 Analytics data is being prepared...</p>
                        <p style="font-size: 0.9rem;">Start using YuVA Wellness features to generate personalized insights!</p>
                    </div>
                `;
            }
        });
    }

    // Utility method to show loading state for specific section
    showLoading(sectionId, message = 'Loading...') {
        const element = document.getElementById(sectionId);
        if (element) {
            element.innerHTML = `<div class="loading">${message}</div>`;
        }
    }

    // Utility method to animate trend bars
    animateTrendBars() {
        const trendBars = document.querySelectorAll('.trend-bar');
        trendBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }
}

// Global functions for backward compatibility
let analyticsDashboard;

async function loadAnalytics() {
    if (analyticsDashboard) {
        await analyticsDashboard.loadAnalytics();
    }
}

function refreshAnalytics() {
    if (analyticsDashboard) {
        analyticsDashboard.refreshAnalytics();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    analyticsDashboard = new AnalyticsDashboard();
});

// Export for use in other components
window.AnalyticsDashboard = AnalyticsDashboard;
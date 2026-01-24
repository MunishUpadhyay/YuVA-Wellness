/**
 * YuVA Wellness - Journal Manager Component
 * Handles journal entry creation, saving, and history management
 */

class JournalManager {
    constructor() {
        this.entries = [];
        this.currentEntry = null;
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setTodayDate();
        this.loadJournalHistory();
    }

    setupElements() {
        this.titleInput = document.getElementById('journal-title');
        this.dateInput = document.getElementById('journal-date');
        this.contentTextarea = document.getElementById('journal-content');
        this.historyDiv = document.getElementById('journal-history');
        this.entriesList = document.getElementById('entries-list');
    }

    setupEventListeners() {
        // Auto-save draft every 30 seconds
        setInterval(() => {
            this.saveDraft();
        }, 30000);

        // Save draft when user stops typing
        let typingTimer;
        if (this.contentTextarea) {
            this.contentTextarea.addEventListener('input', () => {
                clearTimeout(typingTimer);
                typingTimer = setTimeout(() => {
                    this.saveDraft();
                }, 2000);
            });
        }

        // Load draft on page load
        this.loadDraft();
    }

    setTodayDate() {
        if (this.dateInput) {
            const today = new Date().toISOString().split('T')[0];
            this.dateInput.value = today;
        }
    }

    saveDraft() {
        if (!this.contentTextarea) return;
        
        const draft = {
            title: this.titleInput?.value || '',
            content: this.contentTextarea.value,
            date: this.dateInput?.value || '',
            timestamp: new Date().toISOString()
        };

        if (draft.content.trim()) {
            if (window.YuvaUtils) {
                YuvaUtils.StorageUtils.set('journal-draft', draft);
            } else {
                localStorage.setItem('journal-draft', JSON.stringify(draft));
            }
        }
    }

    loadDraft() {
        let draft = null;
        
        try {
            if (window.YuvaUtils) {
                draft = YuvaUtils.StorageUtils.get('journal-draft');
            } else {
                const stored = localStorage.getItem('journal-draft');
                draft = stored ? JSON.parse(stored) : null;
            }
        } catch (error) {
            console.warn('Failed to load draft:', error);
        }
        
        if (draft && draft.content.trim()) {
            if (this.titleInput) this.titleInput.value = draft.title || '';
            if (this.contentTextarea) this.contentTextarea.value = draft.content || '';
            if (this.dateInput) this.dateInput.value = draft.date || '';
            
            // Show notification about loaded draft
            console.log('Draft loaded from previous session');
        }
    }

    async saveJournalEntry() {
        const title = this.titleInput?.value?.trim() || '';
        const content = this.contentTextarea?.value?.trim() || '';
        const entryDate = this.dateInput?.value || '';

        if (!content) {
            alert('Please write something before saving your entry.');
            this.contentTextarea?.focus();
            return;
        }

        try {
            // Show loading state
            const saveButton = document.querySelector('button[onclick="saveJournalEntry()"]');
            const originalText = saveButton?.innerHTML;
            if (saveButton) {
                saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveButton.disabled = true;
            }

            // Use fetch directly if YuvaUtils is not available
            const response = await fetch('/api/journal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    entry_date: entryDate
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            // Clear the form and draft
            this.clearJournalForm();
            if (window.YuvaUtils) {
                YuvaUtils.StorageUtils.remove('journal-draft');
            } else {
                localStorage.removeItem('journal-draft');
            }

            // Show success message
            alert('Journal entry saved successfully! 📝');

            // Refresh history if it's visible
            if (this.historyDiv && this.historyDiv.style.display !== 'none') {
                await this.loadJournalHistory();
            }

            // Restore button
            if (saveButton) {
                saveButton.innerHTML = originalText;
                saveButton.disabled = false;
            }

        } catch (error) {
            console.error('Failed to save journal entry:', error);
            alert('Failed to save entry. Please try again.');
            
            // Restore button
            const saveButton = document.querySelector('button[onclick="saveJournalEntry()"]');
            if (saveButton) {
                saveButton.innerHTML = '💾 Save Entry';
                saveButton.disabled = false;
            }
        }
    }

    clearJournalForm() {
        if (this.titleInput) this.titleInput.value = '';
        if (this.contentTextarea) this.contentTextarea.value = '';
        this.setTodayDate();
        
        // Remove draft with fallback
        if (window.YuvaUtils) {
            YuvaUtils.StorageUtils.remove('journal-draft');
        } else {
            localStorage.removeItem('journal-draft');
        }
        
        alert('Form cleared');
    }

    async loadJournalHistory() {
        try {
            const response = await fetch('/api/journal');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const entries = await response.json();
            this.entries = entries;
            this.renderJournalHistory();
        } catch (error) {
            console.error('Failed to load journal history:', error);
            if (this.entriesList) {
                this.entriesList.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                        <p>Failed to load journal entries</p>
                        <button onclick="journalManager.loadJournalHistory()" class="btn secondary">
                            <i class="fas fa-sync-alt"></i> Try Again
                        </button>
                    </div>
                `;
            }
        }
    }

    renderJournalHistory() {
        if (!this.entriesList) return;

        if (this.entries.length === 0) {
            this.entriesList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-book-open" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>No journal entries yet</p>
                    <p style="font-size: 0.9rem;">Start writing to see your entries here!</p>
                </div>
            `;
            return;
        }

        this.entriesList.innerHTML = this.entries.map(entry => `
            <div class="journal-entry-card" style="
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: var(--border-radius);
                padding: var(--spacing-md);
                margin-bottom: var(--spacing-md);
                transition: var(--transition);
            ">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-sm);">
                    <div>
                        <h4 style="margin: 0; color: var(--primary);">
                            ${entry.title || 'Untitled Entry'}
                        </h4>
                        <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted);">
                            <i class="fas fa-calendar"></i> ${this.formatDate(entry.date)}
                        </p>
                    </div>
                    <div style="display: flex; gap: var(--spacing-xs);">
                        <button onclick="journalManager.editEntry(${entry.id})" class="btn-icon" title="Edit Entry">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="journalManager.deleteEntry(${entry.id})" class="btn-icon danger" title="Delete Entry">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="entry-content" style="
                    max-height: 150px;
                    overflow: hidden;
                    position: relative;
                    line-height: 1.6;
                ">
                    <p style="margin: 0; white-space: pre-wrap;">${this.truncateText(entry.content, 300)}</p>
                    ${entry.content.length > 300 ? `
                        <div style="
                            position: absolute;
                            bottom: 0;
                            right: 0;
                            background: linear-gradient(to right, transparent, var(--bg-card));
                            padding-left: 2rem;
                        ">
                            <button onclick="journalManager.expandEntry(${entry.id})" class="btn-link">
                                Read more...
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        if (!dateString) return 'No date';
        
        try {
            if (window.YuvaUtils && YuvaUtils.DateUtils) {
                return YuvaUtils.DateUtils.formatDate(dateString);
            } else {
                // Fallback date formatting
                return new Date(dateString).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        } catch (error) {
            return dateString;
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    async showJournalHistory() {
        if (!this.historyDiv) return;

        if (this.historyDiv.style.display === 'none') {
            // Show history
            this.historyDiv.style.display = 'block';
            await this.loadJournalHistory();
            
            // Update button text
            const button = document.querySelector('button[onclick="showJournalHistory()"]');
            if (button) button.innerHTML = '📖 Hide History';
            
            // Smooth scroll to history
            this.historyDiv.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Hide history
            this.historyDiv.style.display = 'none';
            
            // Update button text
            const button = document.querySelector('button[onclick="showJournalHistory()"]');
            if (button) button.innerHTML = '📚 View History';
        }
    }

    editEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) return;

        // Load entry into form
        if (this.titleInput) this.titleInput.value = entry.title || '';
        if (this.contentTextarea) this.contentTextarea.value = entry.content || '';
        if (this.dateInput) this.dateInput.value = entry.date || '';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Focus on content
        if (this.contentTextarea) {
            this.contentTextarea.focus();
            this.contentTextarea.setSelectionRange(this.contentTextarea.value.length, this.contentTextarea.value.length);
        }

        // Store current entry ID for updating
        this.currentEntry = entryId;

        YuvaUtils.NotificationUtils.info('Entry loaded for editing');
    }

    async deleteEntry(entryId) {
        if (!confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
            return;
        }

        try {
            await YuvaUtils.ApiUtils.delete(`/api/journal/${entryId}`);
            YuvaUtils.NotificationUtils.success('Journal entry deleted');
            await this.loadJournalHistory();
        } catch (error) {
            console.error('Failed to delete entry:', error);
            YuvaUtils.NotificationUtils.error('Failed to delete entry. Please try again.');
        }
    }

    expandEntry(entryId) {
        const entry = this.entries.find(e => e.id === entryId);
        if (!entry) return;

        // Create modal for full entry view
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>${entry.title || 'Untitled Entry'}</h3>
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p style="color: var(--text-muted); margin-bottom: var(--spacing-md);">
                        <i class="fas fa-calendar"></i> ${YuvaUtils.DateUtils.formatDate(entry.date)}
                    </p>
                    <div style="white-space: pre-wrap; line-height: 1.6;">
                        ${entry.content}
                    </div>
                </div>
                <div class="modal-footer">
                    <button onclick="journalManager.editEntry(${entry.id}); this.closest('.modal-overlay').remove();" class="btn secondary">
                        <i class="fas fa-edit"></i> Edit Entry
                    </button>
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add modal styles if not present
        if (!document.querySelector('#modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'modal-styles';
            styles.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                }
                .modal-content {
                    background: var(--bg-card);
                    border-radius: var(--border-radius-lg);
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-xl);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-lg);
                    border-bottom: 1px solid var(--border-color);
                }
                .modal-body {
                    padding: var(--spacing-lg);
                }
                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: var(--spacing-sm);
                    padding: var(--spacing-lg);
                    border-top: 1px solid var(--border-color);
                }
                .btn-close {
                    background: none;
                    border: none;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: var(--text-muted);
                    padding: 0.5rem;
                    border-radius: var(--border-radius);
                }
                .btn-close:hover {
                    background: var(--bg-secondary);
                    color: var(--text);
                }
                .btn-icon {
                    background: none;
                    border: none;
                    padding: 0.5rem;
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    color: var(--text-muted);
                    transition: var(--transition);
                }
                .btn-icon:hover {
                    background: var(--bg-secondary);
                    color: var(--primary);
                }
                .btn-icon.danger:hover {
                    background: var(--danger);
                    color: white;
                }
                .btn-link {
                    background: none;
                    border: none;
                    color: var(--primary);
                    cursor: pointer;
                    text-decoration: underline;
                }
            `;
            document.head.appendChild(styles);
        }
    }
}

// Global functions for template onclick handlers
function saveJournalEntry() {
    if (window.journalManager) {
        window.journalManager.saveJournalEntry();
    }
}

function clearJournalForm() {
    if (window.journalManager) {
        window.journalManager.clearJournalForm();
    }
}

function showJournalHistory() {
    if (window.journalManager) {
        window.journalManager.showJournalHistory();
    }
}

// Initialize journal manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Journal Manager...');
    window.journalManager = new JournalManager();
    console.log('Journal Manager initialized:', window.journalManager);
});

// Export for global use
window.JournalManager = JournalManager;

// Debug function to test if component is loaded
window.testJournalComponent = function() {
    console.log('Journal component loaded successfully!');
    console.log('YuvaUtils available:', typeof window.YuvaUtils);
    return 'Journal component is working!';
};
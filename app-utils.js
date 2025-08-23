// Utility methods for Easy Transcribe PWA (continued from app.js)

// Add these methods to the EasyTranscribePWA class
EasyTranscribePWA.prototype.showProgress = function() {
    if (this.progressContainer) {
        this.progressContainer.style.display = 'block';
        this.updateProgress(0, 'Initializing...');
    }
};

EasyTranscribePWA.prototype.updateProgress = function(percentage, text) {
    if (this.progressFill) {
        this.progressFill.style.width = `${percentage}%`;
    }
    if (this.progressText) {
        this.progressText.textContent = text;
    }
};

EasyTranscribePWA.prototype.hideProgress = function() {
    if (this.progressContainer) {
        this.progressContainer.style.display = 'none';
        this.progressFill.style.width = '0%';
    }
};

// Result actions
EasyTranscribePWA.prototype.copyToClipboard = async function() {
    try {
        const text = this.transcriptionText?.textContent;
        if (!text) return;
        
        await navigator.clipboard.writeText(text);
        this.showToast('Transcription copied to clipboard!', 'success');
    } catch (error) {
        console.error('Copy failed:', error);
        this.fallbackCopyToClipboard(this.transcriptionText?.textContent);
    }
};

EasyTranscribePWA.prototype.fallbackCopyToClipboard = function(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        this.showToast('Transcription copied to clipboard!', 'success');
    } catch (error) {
        this.showToast('Failed to copy transcription', 'error');
    }
    
    document.body.removeChild(textArea);
};

EasyTranscribePWA.prototype.downloadTranscription = function() {
    const text = this.transcriptionText?.textContent;
    if (!text || text === 'No transcription available') {
        this.showToast('No transcription to download', 'error');
        return;
    }

    const fileName = this.selectedFile ? 
        `transcription-${this.selectedFile.name.split('.')[0]}.txt` : 
        `transcription-${Date.now()}.txt`;

    const content = `Audio Transcription
==================
File: ${this.selectedFile?.name || 'Unknown'}
Model: ${this.selectedModel}
Language: ${this.selectedLanguage || 'Auto-detect'}
Date: ${new Date().toISOString()}

Content:
--------
${text}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('Transcription downloaded!', 'success');
};

EasyTranscribePWA.prototype.saveTranscription = async function() {
    const text = this.transcriptionText?.textContent;
    if (!text || !this.selectedFile) return;
    
    const transcriptionData = {
        filename: `transcription-${Date.now()}.txt`,
        originalName: this.selectedFile.name,
        text: text,
        model: this.selectedModel,
        language: this.selectedLanguage || 'auto',
        fileSize: this.selectedFile.size
    };
    
    const id = await storage.storeTranscription(transcriptionData);
    if (id) {
        this.showToast('Transcription saved to history!', 'success');
        await this.loadTranscriptionHistory();
    } else {
        this.showToast('Failed to save transcription', 'error');
    }
};

// History methods
EasyTranscribePWA.prototype.loadTranscriptionHistory = async function() {
    try {
        const transcriptions = await storage.getAllTranscriptions(50);
        this.displayTranscriptionHistory(transcriptions);
        
        if (this.historyCount) {
            this.historyCount.textContent = transcriptions.length;
        }
    } catch (error) {
        console.error('Failed to load history:', error);
        this.showToast('Failed to load transcription history', 'error');
    }
};

EasyTranscribePWA.prototype.displayTranscriptionHistory = function(transcriptions) {
    if (!this.historyContainer) return;
    
    if (transcriptions.length === 0) {
        this.historyContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No transcriptions yet</h3>
                <p>Your transcription history will appear here</p>
                <button class="btn btn-primary" onclick="app.switchView('transcribe')">
                    Start Transcribing
                </button>
            </div>
        `;
        return;
    }

    const historyHTML = transcriptions.map(t => `
        <div class="history-item" data-id="${t.id}">
            <div class="history-header">
                <div class="history-info">
                    <h4>${t.originalName || t.filename}</h4>
                    <div class="history-meta">
                        ${new Date(t.timestamp).toLocaleDateString()} • 
                        ${this.formatFileSize(t.fileSize || 0)} • 
                        Model: ${t.model}
                        ${t.language !== 'auto' ? ` • ${t.language}` : ''}
                    </div>
                </div>
                <div class="history-actions">
                    <button class="btn-icon ${t.starred ? 'starred' : ''}" 
                            onclick="app.toggleHistoryStar('${t.id}')" 
                            title="${t.starred ? 'Remove from favorites' : 'Add to favorites'}">
                        ${t.starred ? '⭐' : '☆'}
                    </button>
                    <button class="btn-icon" onclick="app.viewHistoryItem('${t.id}')" title="View">
                        👁️
                    </button>
                    <button class="btn-icon" onclick="app.downloadHistoryItem('${t.id}')" title="Download">
                        💾
                    </button>
                    <button class="btn-icon danger" onclick="app.deleteHistoryItem('${t.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="history-preview">
                ${t.text ? t.text.substring(0, 150) + (t.text.length > 150 ? '...' : '') : 'No content'}
            </div>
        </div>
    `).join('');

    this.historyContainer.innerHTML = historyHTML;
};

// History actions
EasyTranscribePWA.prototype.toggleHistoryStar = async function(id) {
    try {
        const starred = await storage.toggleTranscriptionStar(id);
        await this.loadTranscriptionHistory();
        this.showToast(starred ? 'Added to favorites' : 'Removed from favorites', 'success');
    } catch (error) {
        console.error('Failed to toggle star:', error);
        this.showToast('Failed to update favorite', 'error');
    }
};

EasyTranscribePWA.prototype.viewHistoryItem = async function(id) {
    try {
        const transcription = await storage.getTranscription(id);
        if (transcription && this.transcriptionText) {
            this.transcriptionText.textContent = transcription.text;
            this.resultsSection.style.display = 'block';
            this.switchView('transcribe');
            this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Failed to view item:', error);
        this.showToast('Failed to load transcription', 'error');
    }
};

EasyTranscribePWA.prototype.downloadHistoryItem = async function(id) {
    try {
        const transcription = await storage.getTranscription(id);
        if (transcription) {
            const content = `Audio Transcription
==================
File: ${transcription.originalName}
Model: ${transcription.model}
Language: ${transcription.language}
Date: ${new Date(transcription.timestamp).toISOString()}

Content:
--------
${transcription.text}`;

            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = transcription.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Transcription downloaded!', 'success');
        }
    } catch (error) {
        console.error('Failed to download item:', error);
        this.showToast('Failed to download transcription', 'error');
    }
};

EasyTranscribePWA.prototype.deleteHistoryItem = async function(id) {
    if (!confirm('Are you sure you want to delete this transcription?')) {
        return;
    }
    
    try {
        const success = await storage.deleteTranscription(id);
        if (success) {
            await this.loadTranscriptionHistory();
            this.showToast('Transcription deleted', 'success');
        } else {
            this.showToast('Failed to delete transcription', 'error');
        }
    } catch (error) {
        console.error('Failed to delete item:', error);
        this.showToast('Failed to delete transcription', 'error');
    }
};

EasyTranscribePWA.prototype.clearHistory = async function() {
    if (!confirm('Are you sure you want to clear all transcription history? This cannot be undone.')) {
        return;
    }
    
    try {
        // Clear all transcriptions (keep settings)
        await storage.clearAllData();
        await this.loadTranscriptionHistory();
        this.showToast('History cleared successfully', 'success');
    } catch (error) {
        console.error('Failed to clear history:', error);
        this.showToast('Failed to clear history', 'error');
    }
};

EasyTranscribePWA.prototype.exportData = async function() {
    try {
        const data = await storage.exportData();
        if (data) {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `easy-transcribe-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Data exported successfully!', 'success');
        }
    } catch (error) {
        console.error('Failed to export data:', error);
        this.showToast('Failed to export data', 'error');
    }
};

// PWA specific methods
EasyTranscribePWA.prototype.registerServiceWorker = async function() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('Service Worker registered:', registration);
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateAvailable();
                    }
                });
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
};

EasyTranscribePWA.prototype.showUpdateAvailable = function() {
    this.showToast('App update available! Refresh to get the latest version.', 'info', 10000);
};

EasyTranscribePWA.prototype.setupInstallPrompt = function() {
    // Handle install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        
        if (this.installBanner) {
            this.installBanner.style.display = 'block';
        }
    });
};

EasyTranscribePWA.prototype.installApp = async function() {
    if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            this.showToast('App installed successfully!', 'success');
        }
        
        this.deferredPrompt = null;
        if (this.installBanner) {
            this.installBanner.style.display = 'none';
        }
    }
};

EasyTranscribePWA.prototype.dismissInstall = function() {
    if (this.installBanner) {
        this.installBanner.style.display = 'none';
    }
    this.deferredPrompt = null;
};

EasyTranscribePWA.prototype.handleAppInstalled = function() {
    this.showToast('Welcome to Easy Transcribe PWA!', 'success');
    if (this.installBanner) {
        this.installBanner.style.display = 'none';
    }
};

// Network status
EasyTranscribePWA.prototype.handleNetworkChange = function(isOnline) {
    this.isOnline = isOnline;
    this.updateConnectionStatus(isOnline ? 'Online' : 'Offline');
    
    if (isOnline) {
        this.showToast('Connection restored', 'success');
    } else {
        this.showToast('Working offline', 'warning');
    }
};

EasyTranscribePWA.prototype.updateConnectionStatus = function(status) {
    if (this.connectionStatus) {
        this.connectionStatus.textContent = status;
        this.connectionStatus.className = `status ${this.isOnline ? 'online' : 'offline'}`;
    }
    
    if (this.statusIndicator) {
        this.statusIndicator.className = `indicator ${this.isOnline ? 'online' : 'offline'}`;
    }
};

// Service worker messages
EasyTranscribePWA.prototype.handleServiceWorkerMessage = function(event) {
    const { type, data } = event.data;
    
    switch (type) {
        case 'TRANSCRIPTION_COMPLETED':
            this.showToast('Background transcription completed!', 'success');
            this.loadTranscriptionHistory();
            break;
        case 'CACHE_UPDATE':
            this.showToast('App updated in background', 'info');
            break;
    }
};

// Keyboard shortcuts
EasyTranscribePWA.prototype.handleKeyboardShortcuts = function(event) {
    // Ctrl/Cmd + shortcuts
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'u':
                event.preventDefault();
                this.fileInput?.click();
                break;
            case 't':
                event.preventDefault();
                if (this.transcribeBtn && !this.transcribeBtn.disabled) {
                    this.startTranscription();
                }
                break;
            case 'c':
                if (event.target === document.body) {
                    event.preventDefault();
                    this.copyToClipboard();
                }
                break;
            case 'h':
                event.preventDefault();
                this.switchView('history');
                break;
            case 's':
                event.preventDefault();
                this.saveTranscription();
                break;
        }
    }
    
    // Escape key
    if (event.key === 'Escape') {
        if (this.loadingOverlay?.style.display === 'flex') {
            // Cancel operation if possible
            event.preventDefault();
        }
    }
};

// UI helpers
EasyTranscribePWA.prototype.showLoading = function(show) {
    if (this.loadingOverlay) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
};

EasyTranscribePWA.prototype.showToast = function(message, type = 'success', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    if (this.toastContainer) {
        this.toastContainer.appendChild(toast);
    }
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, duration);
};

// Global instance
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EasyTranscribePWA();
});
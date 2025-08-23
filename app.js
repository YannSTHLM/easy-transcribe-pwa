// Easy Transcribe PWA - Main Application
class EasyTranscribePWA {
    constructor() {
        this.selectedFile = null;
        this.apiKey = null;
        this.selectedModel = 'whisper-large-v3';
        this.selectedLanguage = '';
        this.deferredPrompt = null;
        this.isOnline = navigator.onLine;
        this.currentView = 'transcribe';
        
        this.initializeApp();
    }

    async initializeApp() {
        // Wait for storage to initialize
        await this.waitForStorage();
        
        // Initialize UI elements
        this.initializeElements();
        
        // Set up event listeners
        this.attachEventListeners();
        
        // Load saved settings
        await this.loadSavedSettings();
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Set up install prompt
        this.setupInstallPrompt();
        
        // Handle URL parameters
        this.handleUrlParams();
        
        // Load transcription history
        await this.loadTranscriptionHistory();
        
        console.log('Easy Transcribe PWA initialized');
    }

    async waitForStorage() {
        let attempts = 0;
        while (!storage.initialized && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!storage.initialized) {
            console.warn('Storage initialization timed out');
        }
    }

    initializeElements() {
        // Navigation elements
        this.navButtons = document.querySelectorAll('.nav-tab');
        this.views = document.querySelectorAll('.tab-content');
        
        // Debug: Log element counts
        console.log('Navigation buttons found:', this.navButtons.length);
        console.log('Views found:', this.views.length);
        
        // Configuration elements
        this.apiKeyInput = document.getElementById('apiKeyInput');
        this.toggleApiKeyBtn = document.getElementById('toggleApiKey');
        this.modelSelect = document.getElementById('modelSelect');
        this.languageSelect = document.getElementById('languageSelect');
        this.autoSaveCheck = document.getElementById('autoSaveApiKey');
        
        // File upload elements
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('audioFileInput');
        this.browseBtn = document.getElementById('browseBtn');
        this.fileInfo = document.getElementById('fileInfo');
        this.fileName = document.getElementById('fileName');
        this.fileSize = document.getElementById('fileSize');
        this.removeFileBtn = document.getElementById('removeFile');

        // Progress elements
        this.progressContainer = document.getElementById('progressContainer');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');

        // Action buttons
        this.transcribeBtn = document.getElementById('transcribeBtn');
        this.validateBtn = document.getElementById('validateBtn');
        
        // Debug: Check if key buttons exist
        console.log('Transcribe button found:', !!this.transcribeBtn);
        console.log('Validate button found:', !!this.validateBtn);
        console.log('Upload area found:', !!this.uploadArea);

        // Results elements
        this.resultsSection = document.getElementById('resultsSection');
        this.transcriptionText = document.getElementById('transcriptionText');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.saveBtn = document.getElementById('saveBtn');

        // History elements
        this.historyContainer = document.getElementById('historyContainer');
        this.historyCount = document.getElementById('historyCount');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.exportBtn = document.getElementById('exportBtn');

        // Install elements
        this.installBtn = document.getElementById('installBtn');
        this.installBanner = document.getElementById('installBanner');
        this.dismissInstallBtn = document.getElementById('dismissInstall');

        // Status elements
        this.statusIndicator = document.getElementById('statusIndicator');
        this.connectionStatus = document.getElementById('connectionStatus');
        
        // Overlay elements
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toastContainer = document.getElementById('toastContainer');
    }

    attachEventListeners() {
        // Navigation events
        this.navButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.tab || e.target.closest('.nav-tab')?.dataset.tab;
                console.log('Tab clicked:', view);
                this.switchView(view);
            });
        });

        // Configuration events
        this.apiKeyInput?.addEventListener('input', () => this.handleConfigChange());
        this.modelSelect?.addEventListener('change', () => this.handleConfigChange());
        this.languageSelect?.addEventListener('change', () => this.handleConfigChange());
        this.toggleApiKeyBtn?.addEventListener('click', () => this.toggleApiKeyVisibility());
        this.validateBtn?.addEventListener('click', () => this.validateConfiguration());
        this.autoSaveCheck?.addEventListener('change', () => this.handleAutoSaveChange());

        // File upload events
        this.uploadArea?.addEventListener('click', () => this.fileInput?.click());
        this.browseBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.fileInput?.click();
        });
        this.fileInput?.addEventListener('change', (e) => this.handleFileSelect(e));
        this.removeFileBtn?.addEventListener('click', () => this.clearFile());

        // Drag and drop events
        this.uploadArea?.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea?.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea?.addEventListener('drop', (e) => this.handleDrop(e));

        // Action button events
        this.transcribeBtn?.addEventListener('click', () => this.startTranscription());

        // Result action events
        this.copyBtn?.addEventListener('click', () => this.copyToClipboard());
        this.downloadBtn?.addEventListener('click', () => this.downloadTranscription());
        this.saveBtn?.addEventListener('click', () => this.saveTranscription());

        // History events
        this.clearHistoryBtn?.addEventListener('click', () => this.clearHistory());
        this.exportBtn?.addEventListener('click', () => this.exportData());

        // Install events
        this.installBtn?.addEventListener('click', () => this.installApp());
        this.dismissInstallBtn?.addEventListener('click', () => this.dismissInstall());

        // Network events
        window.addEventListener('online', () => this.handleNetworkChange(true));
        window.addEventListener('offline', () => this.handleNetworkChange(false));

        // App events
        window.addEventListener('beforeinstallprompt', (e) => this.handleInstallPrompt(e));
        window.addEventListener('appinstalled', () => this.handleAppInstalled());

        // Service worker events
        navigator.serviceWorker?.addEventListener('message', (event) => {
            this.handleServiceWorkerMessage(event);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Navigation methods
    switchView(viewName) {
        this.currentView = viewName;
        
        // Update navigation
        this.navButtons?.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === viewName);
        });
        
        // Update views
        this.views?.forEach(view => {
            view.classList.toggle('active', view.id === `${viewName}Tab`);
        });
        
        // Load view-specific data
        if (viewName === 'history') {
            this.loadTranscriptionHistory();
        } else if (viewName === 'settings') {
            this.loadSettings();
        }
        
        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('view', viewName);
        history.replaceState(null, '', url);
    }

    handleUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const view = params.get('view') || 'transcribe';
        const action = params.get('action');
        const id = params.get('id');
        
        this.switchView(view);
        
        if (action === 'view' && id) {
            this.viewTranscription(id);
        }
    }

    // Configuration methods
    async handleConfigChange() {
        const hasApiKey = this.apiKeyInput?.value.trim().length > 0;
        const modelChanged = this.selectedModel !== this.modelSelect?.value;
        const languageChanged = this.selectedLanguage !== this.languageSelect?.value;
        
        if (hasApiKey || modelChanged || languageChanged) {
            this.updateTranscribeButtonState();
            
            // Auto-save settings if enabled
            if (this.autoSaveCheck?.checked) {
                await this.saveCurrentSettings();
            }
        }
    }

    toggleApiKeyVisibility() {
        const type = this.apiKeyInput.type === 'password' ? 'text' : 'password';
        this.apiKeyInput.type = type;
        this.toggleApiKeyBtn.textContent = type === 'password' ? '👁️' : '🙈';
    }

    async validateConfiguration() {
        const apiKey = this.apiKeyInput?.value.trim();
        
        if (!apiKey) {
            this.showToast('API key is required', 'error');
            return;
        }

        if (apiKey.length < 10) {
            this.showToast('API key seems too short', 'error');
            return;
        }

        try {
            this.validateBtn.disabled = true;
            this.validateBtn.innerHTML = '<span class="btn-icon">⏳</span>Validating...';
            this.updateConnectionStatus('Validating API key...');

            const response = await fetch('https://api.groq.com/openai/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                this.apiKey = apiKey;
                this.selectedModel = this.modelSelect?.value || 'whisper-large-v3';
                this.selectedLanguage = this.languageSelect?.value || '';
                
                // Save API key if auto-save is enabled
                if (this.autoSaveCheck?.checked) {
                    await storage.storeApiKey(apiKey);
                    await this.saveCurrentSettings();
                }
                
                this.showToast('API key validated successfully!', 'success');
                this.updateTranscribeButtonState();
                this.updateConnectionStatus('API key validated');
                
            } else {
                this.showToast('Invalid API key. Please check and try again.', 'error');
                this.updateConnectionStatus('Invalid API key');
            }

        } catch (error) {
            console.error('Validation error:', error);
            this.showToast('Validation failed. Please check your internet connection.', 'error');
            this.updateConnectionStatus('Validation failed');
        } finally {
            this.validateBtn.disabled = false;
            this.validateBtn.innerHTML = '<span class="btn-icon">✓</span>Validate API Key';
        }
    }

    async handleAutoSaveChange() {
        const isEnabled = this.autoSaveCheck?.checked;
        await storage.storeSetting('auto_save_api_key', isEnabled);
        
        if (isEnabled && this.apiKey) {
            await storage.storeApiKey(this.apiKey);
            this.showToast('API key will be saved locally', 'success');
        }
    }

    // Settings management
    async loadSavedSettings() {
        try {
            // Load auto-save preference
            const autoSave = await storage.getSetting('auto_save_api_key', false);
            if (this.autoSaveCheck) {
                this.autoSaveCheck.checked = autoSave;
            }
            
            // Load API key if auto-save is enabled
            if (autoSave) {
                const savedApiKey = await storage.getApiKey();
                if (savedApiKey && this.apiKeyInput) {
                    this.apiKeyInput.value = savedApiKey;
                    this.apiKey = savedApiKey;
                }
            }
            
            // Load other settings
            this.selectedModel = await storage.getSetting('selected_model', 'whisper-large-v3');
            this.selectedLanguage = await storage.getSetting('selected_language', '');
            
            if (this.modelSelect) {
                this.modelSelect.value = this.selectedModel;
            }
            if (this.languageSelect) {
                this.languageSelect.value = this.selectedLanguage;
            }
            
            this.updateTranscribeButtonState();
            
        } catch (error) {
            console.error('Failed to load saved settings:', error);
        }
    }

    async saveCurrentSettings() {
        try {
            await storage.storeSetting('selected_model', this.modelSelect?.value || this.selectedModel);
            await storage.storeSetting('selected_language', this.languageSelect?.value || this.selectedLanguage);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    updateTranscribeButtonState() {
        const hasFile = this.selectedFile !== null;
        const hasValidApiKey = this.apiKey !== null;
        
        if (this.transcribeBtn) {
            this.transcribeBtn.disabled = !(hasFile && hasValidApiKey);
            
            if (!hasValidApiKey) {
                this.transcribeBtn.innerHTML = '<span class="btn-icon">🔧</span>Validate API Key First';
            } else if (!hasFile) {
                this.transcribeBtn.innerHTML = '<span class="btn-icon">📁</span>Select Audio File';
            } else {
                this.transcribeBtn.innerHTML = '<span class="btn-icon">🚀</span>Start Transcription';
            }
        }
    }

    // File handling methods (similar to previous implementation)
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.setSelectedFile(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea?.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.preventDefault();
        this.uploadArea?.classList.remove('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea?.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.setSelectedFile(files[0]);
        }
    }

    setSelectedFile(file) {
        if (!this.isValidAudioFile(file)) {
            this.showToast('Please select a valid audio file (MP3, WAV, M4A, AAC, OGG, FLAC)', 'error');
            return;
        }

        const maxSize = 25 * 1024 * 1024; // 25MB for PWA
        if (file.size > maxSize) {
            this.showToast('File size exceeds 25MB limit', 'error');
            return;
        }

        this.selectedFile = file;
        this.displayFileInfo(file);
        this.updateTranscribeButtonState();
    }

    isValidAudioFile(file) {
        const validTypes = [
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
            'audio/x-wav', 'audio/aac', 'audio/ogg', 'audio/webm',
            'audio/flac', 'audio/x-flac', 'audio/mp4', 'audio/m4a'
        ];
        return validTypes.includes(file.type) || this.hasValidAudioExtension(file.name);
    }

    hasValidAudioExtension(filename) {
        const validExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'];
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return validExtensions.includes(extension);
    }

    displayFileInfo(file) {
        if (this.fileName) this.fileName.textContent = file.name;
        if (this.fileSize) this.fileSize.textContent = this.formatFileSize(file.size);
        if (this.fileInfo) this.fileInfo.style.display = 'block';
        if (this.uploadArea) this.uploadArea.style.display = 'none';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    clearFile() {
        this.selectedFile = null;
        if (this.fileInput) this.fileInput.value = '';
        if (this.fileInfo) this.fileInfo.style.display = 'none';
        if (this.uploadArea) this.uploadArea.style.display = 'block';
        this.updateTranscribeButtonState();
        this.hideProgress();
    }

    // Transcription methods
    async startTranscription() {
        if (!this.selectedFile) {
            this.showToast('Please select an audio file first', 'error');
            return;
        }

        if (!this.apiKey) {
            this.showToast('Please validate your API key first', 'error');
            return;
        }

        try {
            this.showLoading(true);
            this.showProgress();
            this.transcribeBtn.disabled = true;

            const formData = new FormData();
            formData.append('file', this.selectedFile);
            formData.append('model', this.selectedModel);
            formData.append('response_format', 'json');
            formData.append('temperature', '0');
            
            if (this.selectedLanguage) {
                formData.append('language', this.selectedLanguage);
            }

            this.updateProgress(30, 'Uploading to Groq...');

            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: formData
            });

            this.updateProgress(90, 'Processing transcription...');

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Transcription failed: ${response.status} ${errorData}`);
            }

            const result = await response.json();
            
            this.updateProgress(100, 'Complete!');
            
            setTimeout(async () => {
                await this.displayTranscriptionResult(result);
                this.hideProgress();
                this.showLoading(false);
            }, 500);

        } catch (error) {
            console.error('Transcription error:', error);
            this.showToast(`Transcription failed: ${error.message}`, 'error');
            this.hideProgress();
            this.showLoading(false);
            this.updateTranscribeButtonState();
        }
    }

    async displayTranscriptionResult(result) {
        if (this.transcriptionText) {
            this.transcriptionText.textContent = result.text || 'No transcription available';
        }
        
        if (this.resultsSection) {
            this.resultsSection.style.display = 'block';
            this.resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Auto-save transcription
        if (this.selectedFile) {
            const transcriptionData = {
                filename: `transcription-${Date.now()}.txt`,
                originalName: this.selectedFile.name,
                text: result.text,
                model: this.selectedModel,
                language: this.selectedLanguage || 'auto',
                fileSize: this.selectedFile.size
            };
            
            await storage.storeTranscription(transcriptionData);
        }
        
        this.showToast('Transcription completed and saved!', 'success');
        this.updateTranscribeButtonState();
    }

    // Continued in next part due to length...
    // [The rest of the methods would continue here]
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EasyTranscribePWA();
});
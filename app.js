// Changes in EasyTranscribePWA class

// Replace selectedFile with selectedFiles (array)
this.selectedFiles = [];

// In handleFileSelect and handleDrop
handleFileSelect(event) {
    const files = Array.from(event.target.files);
    this.setSelectedFiles(files);
}

handleDrop(event) {
    event.preventDefault();
    this.uploadArea?.classList.remove('drag-over');
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
        this.setSelectedFiles(files);
    }
}

// New method to handle multiple files
setSelectedFiles(files) {
    const validFiles = files.filter(f => this.isValidAudioFile(f) && f.size <= 25 * 1024 * 1024);
    if (validFiles.length === 0) {
        this.showToast('No valid audio files selected', 'error');
        return;
    }
    this.selectedFiles = validFiles;
    this.displayFileInfo(validFiles);
    this.updateTranscribeButtonState();
    this.showToast(`${validFiles.length} file(s) uploaded successfully!`, 'success');
}

// Adjust displayFileInfo for multiple files
displayFileInfo(files) {
    if (this.fileInfo) {
        this.fileInfo.innerHTML = files.map(file =>
            `<div class="file-meta">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
                <button class="file-remove" data-file="${file.name}">&times;</button>
            </div>`
        ).join('');
        this.fileInfo.style.display = 'block';
        this.uploadArea.style.display = 'none';
    }
    // Add remove handlers
    this.fileInfo.querySelectorAll('.file-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const name = btn.getAttribute('data-file');
            this.selectedFiles = this.selectedFiles.filter(f => f.name !== name);
            this.displayFileInfo(this.selectedFiles);
            this.updateTranscribeButtonState();
        });
    });
}

// Update startTranscription to handle multiple files
async startTranscription() {
    if (!this.selectedFiles || this.selectedFiles.length === 0) {
        this.showToast('Please select audio files first', 'error');
        return;
    }
    if (!this.apiKey) {
        this.showToast('Please validate your API key first', 'error');
        return;
    }

    for (const file of this.selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('model', this.selectedModel);
        formData.append('response_format', 'json');
        formData.append('temperature', '0');
        if (this.selectedLanguage) {
            formData.append('language', this.selectedLanguage);
        }

        this.updateProgress(30, `Uploading ${file.name} to Groq...`);

        const response = await fetch(this.apiEndpointInput.value, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: formData
        });

        this.updateProgress(90, `Processing transcription for ${file.name}...`);

        if (!response.ok) {
            const errorData = await response.text();
            this.showToast(`Transcription failed for ${file.name}: ${response.status} ${errorData}`, 'error');
            continue;
        }

        const result = await response.json();
        await this.displayTranscriptionResult(result, file);
    }
}

// API endpoint config loading/saving (in loadSavedSettings and saveCurrentSettings)
this.apiEndpointInput = document.getElementById('apiEndpointInput');
// Load from storage
this.apiEndpointInput.value = await storage.getSetting('api_endpoint', 'https://api.groq.com/');
// Save to storage on change
this.apiEndpointInput.addEventListener('input', () => {
    storage.storeSetting('api_endpoint', this.apiEndpointInput.value);
});
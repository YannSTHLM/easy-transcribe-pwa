// UI Enhancements for Easy Transcribe PWA
// Additional interactive features and animations

class UIEnhancements {
    constructor() {
        this.initializeEnhancements();
    }

    initializeEnhancements() {
        // Add loading states
        this.addLoadingStates();
        
        // Add micro-interactions
        this.addMicroInteractions();
        
        // Add tooltips
        this.addTooltips();
        
        // Add smooth scrolling
        this.addSmoothScrolling();
        
        // Add keyboard shortcuts info
        this.addKeyboardShortcuts();
    }

    addLoadingStates() {
        // Add pulse animation to cards while loading
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        // Observe all cards and sections
        document.querySelectorAll('.config-section, .upload-section, .results-section').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    }

    addMicroInteractions() {
        // Add ripple effect to buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn') || e.target.classList.contains('nav-btn')) {
                this.createRipple(e);
            }
        });

        // Add hover sound feedback (visual)
        document.querySelectorAll('.btn, .nav-btn, .history-item').forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (!el.classList.contains('active')) {
                    el.style.transform = 'translateY(-1px) scale(1.02)';
                }
            });
            
            el.addEventListener('mouseleave', () => {
                if (!el.classList.contains('active')) {
                    el.style.transform = 'translateY(0) scale(1)';
                }
            });
        });
    }

    createRipple(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        const rippleContainer = button.querySelector('.ripple-container') || button;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        if (!document.querySelector('#ripple-keyframes')) {
            const style = document.createElement('style');
            style.id = 'ripple-keyframes';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        rippleContainer.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addTooltips() {
        // Create tooltip container
        const tooltipContainer = document.createElement('div');
        tooltipContainer.id = 'tooltip-container';
        tooltipContainer.style.cssText = `
            position: fixed;
            background: var(--surface-1, #ffffff);
            color: var(--text-primary, #0f172a);
            padding: 8px 12px;
            font-size: 12px;
            border-radius: 6px;
            border: 1px solid var(--border-medium, #e2e8f0);
            box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
            z-index: 1070;
            pointer-events: none;
            opacity: 0;
            transform: translateY(4px);
            transition: opacity 0.2s ease, transform 0.2s ease;
            max-width: 200px;
            word-wrap: break-word;
        `;
        document.body.appendChild(tooltipContainer);

        // Add tooltips to elements with title attribute
        document.querySelectorAll('[title]').forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.getAttribute('title'), tooltipContainer);
            });
            
            el.addEventListener('mouseleave', () => {
                this.hideTooltip(tooltipContainer);
            });
        });

        // Add custom tooltips
        const tooltips = {
            '#apiKeyInput': 'Your API key is encrypted and stored locally on your device',
            '#modelSelect': 'Choose the Whisper model that best fits your needs',
            '#autoSaveApiKey': 'Save your API key securely using client-side encryption',
            '.toggle-visibility': 'Click to show or hide your API key',
            '.connection-status': 'Shows your current connection status for transcription services'
        };

        Object.entries(tooltips).forEach(([selector, text]) => {
            const element = document.querySelector(selector);
            if (element) {
                element.addEventListener('mouseenter', (e) => {
                    this.showTooltip(e.target, text, tooltipContainer);
                });
                
                element.addEventListener('mouseleave', () => {
                    this.hideTooltip(tooltipContainer);
                });
            }
        });
    }

    showTooltip(target, text, container) {
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        container.textContent = text;
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
        
        // Position tooltip
        const tooltipRect = container.getBoundingClientRect();
        let top = rect.top + scrollTop - tooltipRect.height - 8;
        let left = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
        
        // Adjust if tooltip goes off screen
        if (top < scrollTop) {
            top = rect.bottom + scrollTop + 8;
        }
        
        if (left < scrollLeft) {
            left = scrollLeft + 8;
        } else if (left + tooltipRect.width > scrollLeft + window.innerWidth) {
            left = scrollLeft + window.innerWidth - tooltipRect.width - 8;
        }
        
        container.style.top = `${top}px`;
        container.style.left = `${left}px`;
    }

    hideTooltip(container) {
        container.style.opacity = '0';
        container.style.transform = 'translateY(4px)';
    }

    addSmoothScrolling() {
        // Add smooth scrolling to internal links and view switching
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = document.querySelector(e.target.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    addKeyboardShortcuts() {
        // Add keyboard shortcuts help
        const shortcuts = {
            'Ctrl+1': 'Switch to Transcribe tab',
            'Ctrl+2': 'Switch to History tab',
            'Ctrl+3': 'Switch to Settings tab',
            'Ctrl+U': 'Upload audio file',
            'Ctrl+Enter': 'Start transcription',
            'Ctrl+S': 'Save current transcription',
            'Ctrl+C': 'Copy transcription to clipboard',
            'Escape': 'Clear current selection or close modals'
        };

        // Add keyboard shortcut functionality
        document.addEventListener('keydown', (e) => {
            // Ctrl+1, Ctrl+2, Ctrl+3 for tab switching
            if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
                e.preventDefault();
                const views = ['transcribe', 'history', 'settings'];
                const targetView = views[parseInt(e.key) - 1];
                const navBtn = document.querySelector(`[data-view="${targetView}"]`);
                if (navBtn) navBtn.click();
            }
            
            // Ctrl+U for file upload
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                const fileInput = document.querySelector('#audioFileInput');
                if (fileInput) fileInput.click();
            }
            
            // Escape to clear selection
            if (e.key === 'Escape') {
                document.getSelection().removeAllRanges();
                // Close any open modals or dropdowns
                document.querySelectorAll('.dropdown.open, .modal.open').forEach(el => {
                    el.classList.remove('open');
                });
            }
        });

        // Add shortcuts help to the page
        this.addShortcutsHelp(shortcuts);
    }

    addShortcutsHelp(shortcuts) {
        // Add keyboard shortcuts help to settings page if it exists
        const settingsView = document.querySelector('#settingsView');
        if (settingsView) {
            const shortcutsSection = document.createElement('div');
            shortcutsSection.className = 'settings-group';
            shortcutsSection.innerHTML = `
                <h4>⌨️ Keyboard Shortcuts</h4>
                <div class="shortcuts-list">
                    ${Object.entries(shortcuts).map(([key, desc]) => `
                        <div class="shortcut-item">
                            <kbd class="shortcut-key">${key}</kbd>
                            <span class="shortcut-desc">${desc}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Add styles for shortcuts
            if (!document.querySelector('#shortcuts-styles')) {
                const style = document.createElement('style');
                style.id = 'shortcuts-styles';
                style.textContent = `
                    .shortcuts-list {
                        display: grid;
                        gap: 12px;
                        margin-top: 16px;
                    }
                    
                    .shortcut-item {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        padding: 12px;
                        background: var(--surface-1, #ffffff);
                        border: 1px solid var(--border-medium, #e2e8f0);
                        border-radius: 8px;
                    }
                    
                    .shortcut-key {
                        background: var(--surface-3, #f1f5f9);
                        border: 1px solid var(--border-strong, #cbd5e1);
                        border-radius: 4px;
                        padding: 4px 8px;
                        font-family: 'Monaco', 'Menlo', monospace;
                        font-size: 12px;
                        font-weight: 600;
                        color: var(--text-primary, #0f172a);
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                        min-width: 80px;
                        text-align: center;
                    }
                    
                    .shortcut-desc {
                        flex: 1;
                        font-size: 14px;
                        color: var(--text-secondary, #475569);
                    }
                `;
                document.head.appendChild(style);
            }
            
            settingsView.appendChild(shortcutsSection);
        }
    }

    // Add visual feedback for form validation
    addFormValidation() {
        const inputs = document.querySelectorAll('.config-input');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
            
            input.addEventListener('input', () => {
                // Remove error state on input
                if (input.classList.contains('error')) {
                    input.classList.remove('error');
                }
            });
        });
    }

    validateInput(input) {
        let isValid = true;
        
        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
        }
        
        if (input.type === 'email' && input.value && !this.isValidEmail(input.value)) {
            isValid = false;
        }
        
        if (!isValid) {
            input.classList.add('error');
            // Add error styles
            if (!document.querySelector('#validation-styles')) {
                const style = document.createElement('style');
                style.id = 'validation-styles';
                style.textContent = `
                    .config-input.error {
                        border-color: var(--error-color, #ef4444) !important;
                        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
                    }
                `;
                document.head.appendChild(style);
            }
        } else {
            input.classList.remove('error');
        }
        
        return isValid;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Add progress indicators for long operations
    addProgressIndicators() {
        // This will be called by the main app when transcription starts
        window.UIEnhancements = this;
    }

    showProgress(message = 'Processing...') {
        let progressIndicator = document.querySelector('#progress-indicator');
        
        if (!progressIndicator) {
            progressIndicator = document.createElement('div');
            progressIndicator.id = 'progress-indicator';
            progressIndicator.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--surface-1, #ffffff);
                padding: 24px;
                border-radius: 12px;
                border: 1px solid var(--border-medium, #e2e8f0);
                box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
                z-index: 1060;
                display: flex;
                align-items: center;
                gap: 16px;
                min-width: 200px;
            `;
            
            progressIndicator.innerHTML = `
                <div class="spinner"></div>
                <span class="progress-message">${message}</span>
            `;
            
            document.body.appendChild(progressIndicator);
        } else {
            progressIndicator.querySelector('.progress-message').textContent = message;
            progressIndicator.style.display = 'flex';
        }
    }

    hideProgress() {
        const progressIndicator = document.querySelector('#progress-indicator');
        if (progressIndicator) {
            progressIndicator.style.display = 'none';
        }
    }
}

// Initialize UI enhancements when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new UIEnhancements();
    });
} else {
    new UIEnhancements();
}
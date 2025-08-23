// Secure Storage Manager for Easy Transcribe PWA
class SecureStorage {
    constructor() {
        this.dbName = 'EasyTranscribeDB';
        this.version = 1;
        this.db = null;
        this.encryptionKey = null;
        this.initialized = false;
        
        // Initialize encryption key from device-specific data
        this.initializeEncryption();
    }

    // Initialize encryption for API key storage
    async initializeEncryption() {
        try {
            // Generate or retrieve device-specific encryption key
            let keyData = localStorage.getItem('et_device_key');
            
            if (!keyData) {
                // Generate new device key from random data + device info
                const randomData = crypto.getRandomValues(new Uint8Array(32));
                const deviceInfo = navigator.userAgent + navigator.language + screen.width + screen.height;
                const combinedData = randomData.toString() + deviceInfo;
                
                // Create hash for encryption key
                const encoder = new TextEncoder();
                const data = encoder.encode(combinedData);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                keyData = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
                
                localStorage.setItem('et_device_key', keyData);
            }
            
            this.encryptionKey = keyData;
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize encryption:', error);
            // Fallback to simple storage without encryption
            this.initialized = true;
        }
    }

    // Initialize IndexedDB
    async initDB() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create object stores
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', { keyPath: 'key' });
                    settingsStore.createIndex('key', 'key', { unique: true });
                }

                if (!db.objectStoreNames.contains('transcriptions')) {
                    const transcriptionsStore = db.createObjectStore('transcriptions', { keyPath: 'id' });
                    transcriptionsStore.createIndex('timestamp', 'timestamp', { unique: false });
                    transcriptionsStore.createIndex('filename', 'filename', { unique: false });
                }

                if (!db.objectStoreNames.contains('failed_requests')) {
                    const failedStore = db.createObjectStore('failed_requests', { keyPath: 'id' });
                    failedStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains('api_usage')) {
                    const usageStore = db.createObjectStore('api_usage', { keyPath: 'date' });
                    usageStore.createIndex('date', 'date', { unique: true });
                }
            };
        });
    }

    // Simple encryption/decryption using XOR cipher with device key
    encrypt(text) {
        if (!this.encryptionKey || !text) return text;
        
        try {
            let result = '';
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i);
                const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                result += String.fromCharCode(charCode ^ keyChar);
            }
            return btoa(result); // Base64 encode
        } catch (error) {
            console.error('Encryption failed:', error);
            return text;
        }
    }

    decrypt(encryptedText) {
        if (!this.encryptionKey || !encryptedText) return encryptedText;
        
        try {
            const decoded = atob(encryptedText); // Base64 decode
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i);
                const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                result += String.fromCharCode(charCode ^ keyChar);
            }
            return result;
        } catch (error) {
            console.error('Decryption failed:', error);
            return encryptedText;
        }
    }

    // Store API key securely
    async storeApiKey(apiKey) {
        try {
            await this.initDB();
            const encryptedKey = this.encrypt(apiKey);
            
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            
            await store.put({
                key: 'api_key',
                value: encryptedKey,
                timestamp: Date.now()
            });
            
            console.log('API key stored securely');
            return true;
        } catch (error) {
            console.error('Failed to store API key:', error);
            return false;
        }
    }

    // Retrieve API key
    async getApiKey() {
        try {
            await this.initDB();
            
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get('api_key');
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    if (request.result) {
                        const decryptedKey = this.decrypt(request.result.value);
                        resolve(decryptedKey);
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to retrieve API key:', error);
            return null;
        }
    }

    // Store user settings
    async storeSetting(key, value) {
        try {
            await this.initDB();
            
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            
            await store.put({
                key: key,
                value: value,
                timestamp: Date.now()
            });
            
            return true;
        } catch (error) {
            console.error('Failed to store setting:', error);
            return false;
        }
    }

    // Get user setting
    async getSetting(key, defaultValue = null) {
        try {
            await this.initDB();
            
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);
            
            return new Promise((resolve) => {
                request.onsuccess = () => {
                    resolve(request.result ? request.result.value : defaultValue);
                };
                request.onerror = () => resolve(defaultValue);
            });
        } catch (error) {
            console.error('Failed to get setting:', error);
            return defaultValue;
        }
    }

    // Store transcription result
    async storeTranscription(transcriptionData) {
        try {
            await this.initDB();
            
            const transcription = {
                id: transcriptionData.id || Date.now().toString(),
                filename: transcriptionData.filename,
                originalName: transcriptionData.originalName,
                text: transcriptionData.text,
                model: transcriptionData.model,
                language: transcriptionData.language,
                duration: transcriptionData.duration,
                fileSize: transcriptionData.fileSize,
                timestamp: Date.now(),
                starred: false
            };
            
            const transaction = this.db.transaction(['transcriptions'], 'readwrite');
            const store = transaction.objectStore('transcriptions');
            
            await store.put(transcription);
            
            // Update usage statistics
            await this.updateUsageStats();
            
            return transcription.id;
        } catch (error) {
            console.error('Failed to store transcription:', error);
            return null;
        }
    }

    // Get all transcriptions
    async getAllTranscriptions(limit = 50) {
        try {
            await this.initDB();
            
            const transaction = this.db.transaction(['transcriptions'], 'readonly');
            const store = transaction.objectStore('transcriptions');
            const index = store.index('timestamp');
            const request = index.openCursor(null, 'prev'); // Most recent first
            
            return new Promise((resolve, reject) => {
                const results = [];
                let count = 0;
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor && count < limit) {
                        results.push(cursor.value);
                        count++;
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to get transcriptions:', error);
            return [];
        }
    }

    // Get transcription by ID
    async getTranscription(id) {
        try {
            await this.initDB();
            
            const transaction = this.db.transaction(['transcriptions'], 'readonly');
            const store = transaction.objectStore('transcriptions');
            const request = store.get(id);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to get transcription:', error);
            return null;
        }
    }

    // Delete transcription
    async deleteTranscription(id) {
        try {
            await this.initDB();
            
            const transaction = this.db.transaction(['transcriptions'], 'readwrite');
            const store = transaction.objectStore('transcriptions');
            
            await store.delete(id);
            return true;
        } catch (error) {
            console.error('Failed to delete transcription:', error);
            return false;
        }
    }

    // Star/unstar transcription
    async toggleTranscriptionStar(id) {
        try {
            const transcription = await this.getTranscription(id);
            if (transcription) {
                transcription.starred = !transcription.starred;
                
                const transaction = this.db.transaction(['transcriptions'], 'readwrite');
                const store = transaction.objectStore('transcriptions');
                await store.put(transcription);
                
                return transcription.starred;
            }
            return false;
        } catch (error) {
            console.error('Failed to toggle star:', error);
            return false;
        }
    }

    // Update usage statistics
    async updateUsageStats() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const currentStats = await this.getSetting(`usage_${today}`, { 
                date: today, 
                count: 0, 
                totalChars: 0 
            });
            
            currentStats.count += 1;
            await this.storeSetting(`usage_${today}`, currentStats);
        } catch (error) {
            console.error('Failed to update usage stats:', error);
        }
    }

    // Get usage statistics
    async getUsageStats(days = 30) {
        try {
            const stats = [];
            const today = new Date();
            
            for (let i = 0; i < days; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                const dayStats = await this.getSetting(`usage_${dateStr}`, {
                    date: dateStr,
                    count: 0,
                    totalChars: 0
                });
                
                stats.push(dayStats);
            }
            
            return stats.reverse(); // Oldest first
        } catch (error) {
            console.error('Failed to get usage stats:', error);
            return [];
        }
    }

    // Export all data
    async exportData() {
        try {
            const transcriptions = await this.getAllTranscriptions(1000);
            const settings = {};
            
            // Get non-sensitive settings
            const settingKeys = ['selected_model', 'selected_language', 'theme', 'notifications'];
            for (const key of settingKeys) {
                settings[key] = await this.getSetting(key);
            }
            
            return {
                transcriptions,
                settings,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
        } catch (error) {
            console.error('Failed to export data:', error);
            return null;
        }
    }

    // Clear all data
    async clearAllData() {
        try {
            await this.initDB();
            
            const stores = ['settings', 'transcriptions', 'failed_requests', 'api_usage'];
            
            for (const storeName of stores) {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                await store.clear();
            }
            
            // Clear localStorage as well
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('et_')) {
                    localStorage.removeItem(key);
                }
            });
            
            return true;
        } catch (error) {
            console.error('Failed to clear data:', error);
            return false;
        }
    }
}

// Create global storage instance
const storage = new SecureStorage();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureStorage;
} else {
    window.SecureStorage = SecureStorage;
    window.storage = storage;
}
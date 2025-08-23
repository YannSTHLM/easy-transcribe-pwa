// Service Worker for Easy Transcribe PWA
const CACHE_NAME = 'easy-transcribe-pwa-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/storage.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('[SW] Static files cached successfully');
                // Force activate to take control immediately
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[SW] Service worker activated');
                // Take control of all clients immediately
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle Groq API requests
    if (url.hostname === 'api.groq.com') {
        event.respondWith(handleGroqApiRequest(request));
        return;
    }

    // Handle static files
    if (request.method === 'GET') {
        event.respondWith(handleStaticRequest(request));
        return;
    }
});

// Handle Groq API requests with proper CORS and caching
async function handleGroqApiRequest(request) {
    try {
        // Always try network first for API requests
        const networkResponse = await fetch(request);
        
        // Clone response for caching (if successful)
        if (networkResponse.ok && request.url.includes('/models')) {
            const responseClone = networkResponse.clone();
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, responseClone);
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Groq API request failed:', error);
        
        // Try to serve from cache for model requests
        if (request.url.includes('/models')) {
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                console.log('[SW] Serving Groq API from cache');
                return cachedResponse;
            }
        }
        
        // Return error response
        return new Response(
            JSON.stringify({ 
                error: 'Network unavailable', 
                message: 'Please check your internet connection' 
            }),
            { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Handle static file requests with cache-first strategy
async function handleStaticRequest(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('[SW] Serving from cache:', request.url);
            return cachedResponse;
        }
        
        // If not in cache, try network
        console.log('[SW] Fetching from network:', request.url);
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[SW] Request failed:', error);
        
        // Return offline page or fallback
        if (request.destination === 'document') {
            const cachedIndex = await caches.match('/index.html');
            if (cachedIndex) {
                return cachedIndex;
            }
        }
        
        // Return generic error response
        return new Response(
            'Offline - Content not available',
            { 
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
            }
        );
    }
}

// Handle background sync for failed transcriptions
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);
    
    if (event.tag === 'retry-transcription') {
        event.waitUntil(retryFailedTranscriptions());
    }
});

// Retry failed transcriptions when back online
async function retryFailedTranscriptions() {
    try {
        // Get failed transcriptions from IndexedDB
        const failedTranscriptions = await getFailedTranscriptions();
        
        for (const transcription of failedTranscriptions) {
            try {
                const result = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                    method: 'POST',
                    headers: transcription.headers,
                    body: transcription.formData
                });
                
                if (result.ok) {
                    const data = await result.json();
                    // Store successful result and remove from failed queue
                    await storeSuccessfulTranscription(transcription.id, data);
                    await removeFailedTranscription(transcription.id);
                    
                    // Notify main app
                    self.clients.matchAll().then(clients => {
                        clients.forEach(client => {
                            client.postMessage({
                                type: 'TRANSCRIPTION_COMPLETED',
                                id: transcription.id,
                                data: data
                            });
                        });
                    });
                }
            } catch (error) {
                console.error('[SW] Failed to retry transcription:', error);
            }
        }
    } catch (error) {
        console.error('[SW] Error during background sync:', error);
    }
}

// Handle push notifications for completed transcriptions
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        
        const options = {
            body: data.body || 'Your transcription is ready!',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
            tag: 'transcription-complete',
            data: data.data || {},
            actions: [
                {
                    action: 'view',
                    title: 'View Transcription',
                    icon: '/icons/icon-96x96.png'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(
                data.title || 'Easy Transcribe',
                options
            )
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/?action=view&id=' + event.notification.data.id)
        );
    } else if (event.action === 'dismiss') {
        // Just close the notification
        return;
    } else {
        // Default action - open app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Utility functions for IndexedDB operations
async function getFailedTranscriptions() {
    // This would integrate with the IndexedDB storage system
    // For now, return empty array
    return [];
}

async function storeSuccessfulTranscription(id, data) {
    // Store in IndexedDB
    console.log('[SW] Storing successful transcription:', id);
}

async function removeFailedTranscription(id) {
    // Remove from failed queue in IndexedDB
    console.log('[SW] Removing failed transcription:', id);
}

// Handle app update notifications
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker script loaded');
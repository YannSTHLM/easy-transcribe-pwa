const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers for PWA
app.use((req, res, next) => {
    // PWA requires HTTPS in production, but allow HTTP for development
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Service Worker and Manifest headers
    if (req.url.endsWith('.js') && req.url.includes('sw')) {
        res.setHeader('Service-Worker-Allowed', '/');
        res.setHeader('Cache-Control', 'no-cache');
    }
    
    if (req.url.endsWith('manifest.json')) {
        res.setHeader('Content-Type', 'application/manifest+json');
    }
    
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, filepath) => {
        // Set cache headers for static assets
        if (filepath.endsWith('.css') || filepath.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
        }
        if (filepath.endsWith('manifest.json')) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
        }
    }
}));

// Serve index.html for all routes (SPA behavior)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
        process.exit(0);
    });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Easy Transcribe PWA server running on port ${PORT}`);
    console.log(`📱 Access the app at: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Log service worker and manifest URLs
    console.log(`📋 Manifest URL: http://localhost:${PORT}/manifest.json`);
    console.log(`⚙️ Service Worker: http://localhost:${PORT}/sw.js`);
});

module.exports = app;
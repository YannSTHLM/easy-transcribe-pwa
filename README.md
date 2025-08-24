# 📱 Easy Transcribe PWA

A **Progressive Web App (PWA)** for audio transcription using the Groq API with Whisper models. This app can be installed locally on mobile and desktop browsers, stores API keys securely locally, and works offline.

## 🚀 Key Features

### 📱 Progressive Web App (PWA)
- **Install on Mobile/Desktop**: Add to home screen on mobile or desktop
- **Offline Capable**: Works without internet connection using cached data
- **Native App Experience**: Full-screen, no browser UI when installed
- **Background Sync**: Automatic syncing when connection is restored

### 🔒 Secure Local Storage
- **Encrypted API Key Storage**: Your Groq API key is stored locally and encrypted
- **Auto-Save Settings**: Never re-enter your API key once saved
- **Client-Side Encryption**: XOR cipher with device-specific key generation
- **Privacy First**: No server-side storage, everything stays on your device

### 🎙️ Advanced Transcription
- **Multiple Groq Models**: whisper-large-v3, whisper-large-v3-turbo
- **File Upload Support**: Drag & drop or click to upload audio files
- **Real-time Progress**: Live transcription progress and status updates
- **Multiple Formats**: Supports various audio formats (MP3, WAV, M4A, etc.)

### 📚 History Management
- **Persistent History**: All transcriptions saved locally with timestamps
- **Star Favorites**: Mark important transcriptions for quick access
- **Export Options**: Download transcriptions as text files
- **Search & Filter**: Find transcriptions by filename or content

### 🎨 Modern Interface
- **Mobile-First Design**: Optimized for touch devices and small screens
- **Material Design**: Clean, modern UI with smooth animations
- **Dark Mode Support**: Automatic dark/light mode based on device preference
- **Responsive Layout**: Works perfectly on phones, tablets, and desktops

## 🌐 Live Demo

**Demo PWA URL**: https://3001-iup0c9kfew126qirisan7-6532622b.e2b.dev/

> **Note**: This is a demo URL. For production use, deploy to your own hosting service using the instructions below.

### 📲 Installation Instructions

#### On Mobile (iOS/Android):
1. Open the PWA URL in your mobile browser (or your deployed version)
2. Look for "Add to Home Screen" notification banner
3. Tap "Install" to add the app to your home screen
4. The app will now work like a native mobile app

#### On Desktop (Chrome/Edge/Firefox):
1. Open the PWA URL in your desktop browser (or your deployed version)
2. Look for the "Install" button in the address bar
3. Click "Install" to add the app to your applications
4. Launch from your apps menu for native-like experience

## 🛠️ Technical Architecture

### Core Technologies
- **Frontend**: Vanilla JavaScript ES6+ with PWA features
- **Backend**: Express.js server for static file serving
- **Storage**: IndexedDB for persistent local data storage
- **Service Worker**: Advanced caching and offline capabilities
- **API Integration**: Groq API with Whisper models

### File Structure
```
transcribe-pwa/
├── 📄 index.html          # Main PWA interface with tabbed navigation
├── 🎨 styles.css          # Material Design CSS with mobile-responsive layout
├── ⚙️ app.js              # Core PWA application logic and API integration
├── 🔧 app-utils.js        # Extended PWA utilities and history management
├── 💾 storage.js          # Secure IndexedDB storage with encryption
├── 🔄 sw.js              # Service Worker with offline caching and sync
├── 📋 manifest.json       # PWA manifest for installation and app metadata
├── 🖥️ server.js          # Express server with PWA-optimized headers
├── ⚡ ecosystem.config.js  # PM2 configuration for production deployment
└── 📦 package.json        # Node.js dependencies and scripts
```

### Security Features
- **Client-Side Encryption**: API keys encrypted using device fingerprinting
- **HTTPS Only**: Service workers require secure contexts
- **Content Security Policy**: Prevents XSS attacks and unauthorized scripts
- **Local-Only Storage**: No data transmitted to external servers except Groq API

## 🔧 Development & Deployment

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Groq API key (get free at https://console.groq.com/)

### Local Development
```bash
# Clone and setup
git clone https://github.com/YannSTHLM/easy-transcribe-pwa.git
cd easy-transcribe-pwa

# Install dependencies
npm install

# Start development server
npm run dev
# or
node server.js

# Using PM2 for production-like environment
npm run pm2:start
```

### Production Deployment Options

#### 1. Static Hosting (GitHub Pages, Netlify, Vercel)
```bash
# Build static files (no build step needed - vanilla JS)
# Deploy entire folder to static hosting service
# Ensure HTTPS is enabled for PWA functionality
```

#### 2. Node.js Hosting (Railway, Render, Digital Ocean)
```bash
# Use included server.js and ecosystem.config.js
npm start
# or with PM2
npm run pm2:start
```

#### 3. Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

### Environment Configuration
- **PORT**: Server port (default: 3001)
- **NODE_ENV**: Environment mode (development/production)

## 📱 PWA Installation & Usage Guide

### First Time Setup
1. **Access the App**: Visit the PWA URL in your browser
2. **Install PWA**: Click "Install" when prompted or use browser menu
3. **Enter API Key**: Go to Settings tab and enter your Groq API key
4. **Enable Auto-Save**: Check "Remember API key" to save it locally
5. **Start Transcribing**: Switch to Transcribe tab and upload audio files

### Using the App
1. **Upload Audio**: Drag & drop or click to select audio files
2. **Choose Model**: Select whisper model (large-v3 recommended)
3. **Start Transcription**: Click "Transcribe Audio" button
4. **View Results**: Results appear in real-time with progress indicator
5. **Save & Export**: Copy text, download as file, or save to history

### Managing History
- **View All**: History tab shows all past transcriptions
- **Star Important**: Click star icon to mark favorites
- **Search**: Use search box to find specific transcriptions
- **Export**: Download individual transcriptions or entire history
- **Delete**: Remove unwanted transcriptions to free space

### Settings & Privacy
- **API Key Management**: Update or remove stored API key
- **Auto-Save Control**: Toggle automatic API key saving
- **Storage Info**: View local storage usage and clear data
- **Privacy Mode**: Disable history saving for sensitive content

## 🔒 Privacy & Security

### What Stays Local
- ✅ Your Groq API key (encrypted)
- ✅ All transcription history
- ✅ App settings and preferences
- ✅ Uploaded audio files (temporary, deleted after transcription)

### What Gets Sent to Groq
- ❌ Only the audio file for transcription
- ❌ No personal information or metadata
- ❌ No API keys or settings

### Encryption Details
- **Algorithm**: XOR cipher with device-specific key
- **Key Generation**: Based on navigator properties and timestamps
- **Storage**: IndexedDB with encrypted values
- **Decryption**: Only possible on the original device

## 🚀 Advanced Features

### Offline Capabilities
- **Service Worker Caching**: App works without internet
- **Background Sync**: Queues transcriptions for when online
- **Offline History**: View and search past transcriptions offline
- **Progressive Loading**: Core functionality loads instantly

### Performance Optimizations
- **Lazy Loading**: Features load as needed
- **Efficient Caching**: Smart cache invalidation and updates
- **Minimal Dependencies**: Lightweight vanilla JavaScript
- **Responsive Images**: Optimized for different screen densities

### Accessibility Features
- **Keyboard Navigation**: Full app usable with keyboard only
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **High Contrast**: Supports system dark/light mode preferences
- **Touch Optimized**: Large touch targets for mobile use

## 🐛 Troubleshooting

### Common Issues

**PWA Won't Install**
- Ensure you're using HTTPS (required for PWA)
- Clear browser cache and try again
- Make sure manifest.json is accessible

**API Key Not Saving**
- Check if browser blocks IndexedDB
- Enable cookies and local storage
- Try incognito mode to test

**Transcription Fails**
- Verify API key is correct
- Check file format is supported
- Ensure file size is under Groq limits
- Check network connection

**App Runs Slowly**
- Clear transcription history to free storage
- Restart browser or device
- Check available device memory

### Browser Support
- ✅ Chrome 88+ (full PWA support)
- ✅ Firefox 85+ (good PWA support)
- ✅ Safari 14+ (basic PWA support)
- ✅ Edge 88+ (full PWA support)

### Mobile Support
- ✅ iOS 14+ (Safari, Chrome, Firefox)
- ✅ Android 8+ (Chrome, Firefox, Samsung Internet)
- ✅ Tablets and iPads (full responsive design)

## 📊 Storage Management

### Local Storage Usage
- **API Key**: ~100 bytes (encrypted)
- **App Settings**: ~500 bytes
- **Each Transcription**: ~1-10 KB (depends on length)
- **Audio Files**: Temporary (deleted after transcription)

### Storage Limits
- **Desktop**: ~10-50 GB (varies by browser)
- **Mobile**: ~5-20 GB (varies by device)
- **Automatic Cleanup**: Old transcriptions auto-archived

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Create Pull Request

### Code Standards
- **ES6+ JavaScript**: Modern syntax and features
- **Mobile-First CSS**: Responsive design approach
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Lighthouse score 90+

## 📄 License

MIT License - feel free to use in your own projects!

## 🙏 Acknowledgments

- **Groq**: For providing fast and accurate Whisper API
- **Material Design**: For design system inspiration
- **PWA Community**: For best practices and patterns

---

## 🔗 Links

- **GitHub Repository**: https://github.com/YannSTHLM/easy-transcribe-pwa
- **Groq Console**: https://console.groq.com/
- **PWA Documentation**: https://web.dev/progressive-web-apps/

---

**Made with ❤️ for seamless audio transcription everywhere**

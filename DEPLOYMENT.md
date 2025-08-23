# 🚀 Deployment Guide - Easy Transcribe PWA

This guide covers multiple deployment options for the Easy Transcribe PWA.

## 📋 Prerequisites

- **Groq API Key**: Get free at https://console.groq.com/
- **HTTPS Required**: PWAs require secure contexts for service workers
- **Node.js 16+**: For server-side deployment options

## 🌐 Static Hosting (Recommended for PWAs)

### GitHub Pages

1. **Fork Repository**:
   ```bash
   # Fork https://github.com/YannSTHLM/easy-transcribe-pwa
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / (root)
   - Save

3. **Access PWA**:
   - URL: `https://yourusername.github.io/easy-transcribe-pwa/`
   - Wait 5-10 minutes for deployment

### Netlify

1. **Deploy from Git**:
   ```bash
   # Connect your GitHub repository to Netlify
   # Build settings are automatically detected from netlify.toml
   ```

2. **Manual Deploy**:
   ```bash
   # Drag and drop entire project folder to Netlify
   ```

3. **Environment**:
   - Build command: `npm install`
   - Publish directory: `.` (root)
   - Node version: 18

### Vercel

1. **Deploy from Git**:
   ```bash
   # Import project from GitHub to Vercel
   # Settings automatically detected from vercel.json
   ```

2. **CLI Deploy**:
   ```bash
   npm install -g vercel
   vercel --prod
   ```

## 🖥️ Server Hosting

### Railway

1. **Deploy from GitHub**:
   - Connect repository to Railway
   - Settings automatically detected from railway.json
   - Auto-deploys on git push

2. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   ```

### Render

1. **Deploy from GitHub**:
   - Connect repository to Render
   - Settings automatically detected from render.yaml
   - Free tier available

2. **Manual Configuration**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

### Heroku

1. **Deploy with Git**:
   ```bash
   # Install Heroku CLI
   heroku create easy-transcribe-pwa
   git push heroku main
   ```

2. **Configuration**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set PORT=3001
   ```

### DigitalOcean App Platform

1. **Deploy from GitHub**:
   - Create new app from repository
   - Detect Node.js automatically
   - Configure environment variables

2. **App Spec**:
   ```yaml
   name: easy-transcribe-pwa
   services:
   - name: web
     source_dir: /
     github:
       repo: yourusername/easy-transcribe-pwa
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
   ```

## 🐳 Docker Deployment

### Docker Compose (Recommended)

1. **Clone and Deploy**:
   ```bash
   git clone https://github.com/YannSTHLM/easy-transcribe-pwa.git
   cd easy-transcribe-pwa
   docker-compose up -d
   ```

2. **Custom Domain**:
   - Update `docker-compose.yml` with your domain
   - Configure reverse proxy (Traefik/Nginx)

### Docker Run

1. **Build and Run**:
   ```bash
   docker build -t easy-transcribe-pwa .
   docker run -d -p 3001:3001 --name transcribe-pwa easy-transcribe-pwa
   ```

2. **With Volume**:
   ```bash
   docker run -d -p 3001:3001 -v $(pwd)/logs:/app/logs easy-transcribe-pwa
   ```

### Docker Hub

1. **Pull and Run**:
   ```bash
   # Will be available after first Docker Hub publish
   docker pull yannsthlm/easy-transcribe-pwa:latest
   docker run -d -p 3001:3001 yannsthlm/easy-transcribe-pwa:latest
   ```

## ☁️ Cloud Deployment

### AWS

#### Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli
eb init
eb create production
eb deploy
```

#### EC2 with PM2
```bash
# SSH into EC2 instance
sudo apt update
sudo apt install nodejs npm
git clone https://github.com/YannSTHLM/easy-transcribe-pwa.git
cd easy-transcribe-pwa
npm install
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### Google Cloud Platform

#### Cloud Run
```bash
gcloud run deploy easy-transcribe-pwa \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Compute Engine
```bash
# Similar to EC2 deployment
# Use startup script for auto-deployment
```

### Microsoft Azure

#### Container Instances
```bash
az container create \
  --resource-group myResourceGroup \
  --name easy-transcribe-pwa \
  --image yourusername/easy-transcribe-pwa:latest \
  --ports 3001 \
  --dns-name-label transcribe-pwa
```

## 🔧 Self-Hosted

### VPS/Dedicated Server

1. **Prerequisites**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install nodejs npm nginx certbot
   
   # CentOS/RHEL
   sudo yum install nodejs npm nginx certbot
   ```

2. **Application Setup**:
   ```bash
   git clone https://github.com/YannSTHLM/easy-transcribe-pwa.git
   cd easy-transcribe-pwa
   npm install
   npm install -g pm2
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**:
   ```nginx
   server {
       listen 80;
       server_name transcribe.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **SSL Certificate**:
   ```bash
   sudo certbot --nginx -d transcribe.yourdomain.com
   ```

### Home Server

1. **Port Forwarding**:
   - Router: Forward port 80/443 to local server
   - Firewall: Allow ports 80/443

2. **Dynamic DNS** (if needed):
   ```bash
   # Use services like DuckDNS, No-IP, or DynDNS
   ```

3. **Local Network Access**:
   ```bash
   # Access via local IP
   http://192.168.x.x:3001
   ```

## 📱 PWA Installation After Deployment

### Mobile (iOS/Android)
1. Open deployed URL in mobile browser
2. Look for "Add to Home Screen" banner
3. Tap "Install" or "Add"
4. App appears on home screen

### Desktop (Chrome/Edge/Firefox)
1. Open deployed URL in desktop browser
2. Look for install icon in address bar
3. Click "Install" 
4. App appears in applications menu

## 🔒 Security Considerations

### HTTPS Requirement
- **Critical**: PWAs require HTTPS for service workers
- **Free SSL**: Use Let's Encrypt for free certificates
- **CDN**: CloudFlare provides free SSL and CDN

### Environment Variables
```bash
NODE_ENV=production
PORT=3001
# Add any other sensitive configurations
```

### Content Security Policy
- Already configured in server.js
- Modify headers as needed for your domain

## 📊 Monitoring

### Health Checks
- **Endpoint**: `/` returns 200 status
- **Docker**: Built-in health check
- **PM2**: Auto-restart on failure

### Logs
```bash
# PM2 logs
pm2 logs easy-transcribe-pwa

# Docker logs  
docker logs transcribe-pwa

# Application logs
tail -f logs/combined.log
```

## 🚀 Performance Optimization

### CDN Configuration
- **Static Assets**: Serve CSS/JS from CDN
- **Images**: Optimize and serve from CDN
- **Caching**: Configure proper cache headers

### Compression
```nginx
# Nginx gzip configuration
gzip on;
gzip_types text/css application/javascript application/json;
```

## 🔄 Updates

### Automated Deployment
```bash
# GitHub Actions (example)
name: Deploy PWA
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - name: Deploy to production
        run: # Your deployment script
```

### Manual Updates
```bash
git pull origin main
npm install
pm2 restart easy-transcribe-pwa
```

## 🆘 Troubleshooting

### Common Issues

**PWA Not Installing**
- Ensure HTTPS is enabled
- Check manifest.json accessibility
- Verify service worker registration

**Service Worker Errors**
- Clear browser cache
- Check console for errors
- Ensure HTTPS context

**Build Failures**
- Check Node.js version (16+ required)
- Verify package.json dependencies
- Check build logs for errors

### Support

- **GitHub Issues**: https://github.com/YannSTHLM/easy-transcribe-pwa/issues
- **Documentation**: Check README.md for detailed information
- **Community**: Create discussions for help

---

Choose the deployment method that best fits your needs. Static hosting (GitHub Pages, Netlify) is recommended for simplicity, while server hosting provides more control and features.
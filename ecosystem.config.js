module.exports = {
  apps: [{
    name: 'easy-transcribe-pwa',
    script: 'server.js',
    cwd: '/home/user/transcribe-pwa',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/home/user/transcribe-pwa/logs/error.log',
    out_file: '/home/user/transcribe-pwa/logs/out.log',
    log_file: '/home/user/transcribe-pwa/logs/combined.log',
    time: true,
    autorestart: true,
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
#!/bin/bash
set -e

echo "=== [Frontend VM] Installing Node.js 20 ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y curl nginx rsync
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "=== [Frontend VM] Copying app to local directory (avoids VirtualBox symlink issue) ==="
mkdir -p /opt/frontend
rsync -a --exclude='node_modules' --exclude='dist' /app/frontend/ /opt/frontend/

echo "=== [Frontend VM] Installing npm dependencies & building ==="
cd /opt/frontend
npm install
npm run build

echo "=== [Frontend VM] Configuring Nginx ==="
cat > /etc/nginx/sites-available/letterboxd <<'NGINX'
server {
    listen 80;
    server_name _;
    root /opt/frontend/dist;
    index index.html;

    # Serve static files, fallback to index.html for SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend VM
    location /api/ {
        proxy_pass http://192.168.56.11:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/letterboxd /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx
systemctl enable nginx

echo "=== [Frontend VM] Done! App running on http://192.168.56.12 ==="
echo "=== Or on your host machine: http://localhost:8080 ==="

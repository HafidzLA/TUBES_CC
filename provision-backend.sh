#!/bin/bash
set -e

echo "=== [Backend VM] Installing Node.js 20 ==="
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y curl rsync
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "=== [Backend VM] Copying app to local directory (avoids VirtualBox symlink issue) ==="
# VirtualBox shared folders do not support symlinks required by npm.
# We copy the source to a local VM path and install from there.
mkdir -p /opt/backend
rsync -a --exclude='node_modules' /app/backend/ /opt/backend/

echo "=== [Backend VM] Installing npm dependencies ==="
cd /opt/backend
npm install

echo "=== [Backend VM] Installing PM2 process manager ==="
npm install -g pm2

echo "=== [Backend VM] Starting backend server with PM2 ==="
cd /opt/backend
pm2 start server.js --name letterboxd-backend
pm2 startup systemd -u root --hp /root
pm2 save

echo "=== [Backend VM] Done! API running on http://0.0.0.0:3000 ==="

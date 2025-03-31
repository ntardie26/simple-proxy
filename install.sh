#!/bin/bash
# Simple Web Proxy Installation Script

echo "Starting Simple Web Proxy Installation..."

# Update system
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install dependencies
echo "Installing Node.js and other dependencies..."
apt-get install -y curl git
curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
apt-get install -y nodejs

# Install PM2 globally
echo "Installing PM2 process manager..."
npm install -g pm2

# Clone the repository
echo "Cloning the Simple Web Proxy repository..."
git clone https://github.com/yourusername/simple-web-proxy.git
cd simple-web-proxy

# Install project dependencies
echo "Installing project dependencies..."
npm install

# Start the proxy with PM2
echo "Starting proxy with PM2..."
npm run pm2

# Setup PM2 to start on boot
echo "Setting up PM2 to start on system boot..."
pm2 startup
pm2 save

echo "Installation complete! Simple Web Proxy is now running on port 3000."
echo "You can access it via: http://your-server-ip:3000"
echo ""
echo "To set up with a domain and HTTPS, install NGINX and Let's Encrypt."
echo "See the README for more details."
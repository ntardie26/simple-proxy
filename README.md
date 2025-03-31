# Simple Web Proxy

No tracking, no useless stuff, just a dead simple proxy.

## Features

- **Anonymous Browsing**: Hide your IP address and protect your identity
- **Access Restricted Content**: Bypass content filters and regional restrictions
- **No Software Required**: Works directly in your browser
- **Fast and Reliable**: Minimal impact on browsing speed
- **URL Encoding**: Securely access websites through the proxy

## How to Use

1. Run: `npm start`
2. Go to: `http://localhost:3000`
3. Enter the URL you want to visit
4. Browse with complete privacy

## VPS Deployment


1. Clone this repository to your VPS
2. Install dependencies: `npm install -g pm2`
3. Start proxy with PM2: `npm run pm2`
4. Set up NGINX (optional):
   ```
   server {
       listen 80;
       server_name yourproxy.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
5. Access your proxy via your domain or IP

To update the proxy: `git pull && npm run pm2:restart`
To view logs: `npm run pm2:logs`
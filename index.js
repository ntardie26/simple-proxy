const http = require('http');
const https = require('https');
const url = require('url');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');

// Load configuration
let config = {
  serverPort: 3000,
  proxySettings: {
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    removeTracking: true,
    removeFrameOptions: true,
    removeContentSecurityPolicy: true,
    doNotTrack: true,
    clearCookies: true
  },
  advanced: {
    rewriteUrls: true,
    removeScripts: false,
    timeout: 30000,
    maxContentSize: 10485760
  },
  logging: {
    enabled: false,
    level: "error",
    file: "proxy.log"
  }
};

// Try to load config from file
try {
  const configPath = path.join(__dirname, 'config.json');
  if (fs.existsSync(configPath)) {
    const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config = { ...config, ...fileConfig };
    console.log("Configuration loaded from config.json");
  }
} catch (error) {
  console.error("Error loading configuration:", error.message);
}

// Logger function
const logger = {
  log: (message, level = 'info') => {
    if (!config.logging.enabled) return;
    
    const levels = ['error', 'warn', 'info', 'debug'];
    const configLevelIndex = levels.indexOf(config.logging.level);
    const messageLevelIndex = levels.indexOf(level);
    
    if (messageLevelIndex <= configLevelIndex) {
      const logMessage = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
      console.log(logMessage);
      
      if (config.logging.file) {
        try {
          fs.appendFileSync(config.logging.file, logMessage + '\n');
        } catch (error) {
          console.error("Error writing to log file:", error.message);
        }
      }
    }
  },
  error: (message) => logger.log(message, 'error'),
  warn: (message) => logger.log(message, 'warn'),
  info: (message) => logger.log(message, 'info'),
  debug: (message) => logger.log(message, 'debug')
};

// Clear all data after responding
const cleanupData = (data) => {
  // Immediately overwrite memory with zeros
  if (data && typeof data === 'object') {
    Object.keys(data).forEach(key => {
      data[key] = null;
    });
  }
  return null;
};

// Convert relative URLs to absolute
function rewriteUrls(content, baseUrl) {
  if (!config.advanced.rewriteUrls) return content;
  
  try {
    const parsedUrl = url.parse(baseUrl);
    const base = parsedUrl.protocol + '//' + parsedUrl.host;
    
    // Replace relative URLs with absolute ones
    content = content.replace(/\s(href|src|action)=(["'])(\/[^"']*)(["'])/gi, ` $1=$2${base}$3$4`);
    content = content.replace(/\s(href|src|action)=(["'])((?!http|https|\/\/|#|javascript:|mailto:|data:)[^"']*)(["'])/gi, 
      (match, attr, quote, value, endQuote) => {
        return ` ${attr}=${quote}${base}/${value}${endQuote}`;
      }
    );
    
    // Rewrite URLs to be proxied
    content = content.replace(/\s(href|src|action)=(["'])(https?:\/\/[^"']*)(["'])/gi, 
      (match, attr, quote, value, endQuote) => {
        return ` ${attr}=${quote}/${value}${endQuote}`;
      }
    );
    
    return content;
  } catch (e) {
    logger.error('Error rewriting URLs: ' + e.message);
    return content;
  }
}

const server = http.createServer((req, res) => {
  const reqUrl = req.url.slice(1);
  
  logger.debug(`Request: ${req.method} ${req.url}`);
  
  // Handle static files for our UI
  if (reqUrl === 'styles.css') {
    res.writeHead(200, { 'Content-Type': 'text/css' });
    res.end(`
      body, html {
        margin: 0;
        padding: 0;
        height: 100%;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f8f9fa;
      }
      .toolbar {
        background-color: #2c3e50;
        color: white;
        padding: 10px;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }
      .logo {
        font-weight: bold;
        font-size: 18px;
        margin-right: 15px;
        color: #3498db;
      }
      .address-bar {
        flex-grow: 1;
        margin: 0 10px;
        position: relative;
      }
      .address-bar input {
        width: 100%;
        padding: 8px 12px;
        border-radius: 4px;
        border: none;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
        font-size: 14px;
      }
      button {
        background: #3498db;
        border: none;
        color: white;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 5px;
        transition: background 0.2s ease;
      }
      button:hover {
        background: #2980b9;
      }
      .content {
        position: absolute;
        top: 58px;
        left: 0;
        right: 0;
        bottom: 0;
        border: none;
        width: 100%;
        height: calc(100% - 58px);
        background: white;
      }
      .homepage {
        max-width: 800px;
        margin: 80px auto 0;
        text-align: center;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .homepage h1 {
        color: #2c3e50;
        margin-bottom: 10px;
      }
      .homepage p {
        color: #7f8c8d;
        margin-bottom: 30px;
      }
      .homepage input {
        width: 80%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
        margin-bottom: 15px;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
      }
      .homepage button {
        padding: 12px 25px;
        font-size: 16px;
      }
      .features {
        display: flex;
        justify-content: space-around;
        margin-top: 40px;
        text-align: center;
      }
      .feature {
        flex: 1;
        max-width: 200px;
        padding: 15px;
      }
      .feature h3 {
        color: #2c3e50;
      }
      .feature p {
        color: #7f8c8d;
        font-size: 14px;
      }
      .settings-icon {
        margin-left: 10px;
        cursor: pointer;
      }
    `);
    return;
  }
  
  if (reqUrl === 'script.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript' });
    res.end(`
      function navigate() {
        const url = document.getElementById('urlInput').value.trim();
        if (url) {
          let targetUrl = url;
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            targetUrl = 'https://' + url;
          }
          window.location.href = '/' + targetUrl;
        }
        return false;
      }
      
      function reloadFrame() {
        const frame = document.querySelector('iframe');
        if (frame) {
          frame.src = frame.src;
        }
      }
    `);
    return;
  }
  
  if (!reqUrl || reqUrl === 'favicon.ico') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>Simple Web Proxy</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="/styles.css">
          <script src="/script.js"></script>
        </head>
        <body>
          <div class="homepage">
            <h1>Simple Web Proxy</h1>
            <p>Browse the web anonymously and access restricted content</p>
            <form onsubmit="return navigate()">
              <input type="text" id="urlInput" placeholder="Enter URL (e.g. youtube.com)" autofocus />
              <button type="submit">Browse Anonymously</button>
            </form>
            <div class="features">
              <div class="feature">
                <h3>Anonymous</h3>
                <p>Hide your IP address and browse privately</p>
              </div>
              <div class="feature">
                <h3>Unrestricted</h3>
                <p>Access blocked websites and content</p>
              </div>
              <div class="feature">
                <h3>Simple</h3>
                <p>No software to install, just browse</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    return;
  }

  let targetUrl;
  try {
    targetUrl = reqUrl.startsWith('http') ? reqUrl : `http://${reqUrl}`;
    const parsedUrl = url.parse(targetUrl);
    if (!parsedUrl.hostname) {
      throw new Error('Invalid URL');
    }
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Invalid URL');
    logger.error(`Invalid URL requested: ${reqUrl}`);
    return;
  }

  // For the UI version, we wrap the content in our interface
  if (req.headers.accept && req.headers.accept.includes('text/html') && !reqUrl.startsWith('raw/')) {
    res.writeHead(200, { 
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(`
      <html>
        <head>
          <title>Proxying: ${targetUrl}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="/styles.css">
          <script src="/script.js"></script>
        </head>
        <body>
          <div class="toolbar">
            <div class="logo">SimpleProxy</div>
            <form class="address-bar" onsubmit="return navigate()">
              <input type="text" id="urlInput" value="${targetUrl}" />
            </form>
            <button onclick="navigate()">Go</button>
            <button onclick="reloadFrame()">Reload</button>
            <button onclick="location.href='/'">Home</button>
          </div>
          <iframe src="/raw/${targetUrl}" class="content" sandbox="allow-forms allow-scripts allow-same-origin"></iframe>
        </body>
      </html>
    `);
    logger.info(`Proxying UI for: ${targetUrl}`);
    return;
  }

  // Handle raw content for the iframe
  if (reqUrl.startsWith('raw/')) {
    const rawUrl = reqUrl.substring(4);
    proxyRequest(rawUrl, req, res, true);
    return;
  }

  // Regular proxy handling
  proxyRequest(targetUrl, req, res, false);
});

function proxyRequest(targetUrl, req, res, isIframe) {
  logger.debug(`Proxying request to: ${targetUrl}`);
  
  const options = url.parse(targetUrl);
  
  // Remove any existing tracking headers and set privacy-focused ones
  const headers = {
    'User-Agent': config.proxySettings.userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Referer': ''  // Empty referer for privacy
  };
  
  // Add Do Not Track header if enabled
  if (config.proxySettings.doNotTrack) {
    headers['DNT'] = '1';
  }

  // Copy specific headers from original request
  const headersToCopy = ['accept', 'content-type', 'content-length'];
  headersToCopy.forEach(header => {
    if (req.headers[header]) {
      headers[header] = req.headers[header];
    }
  });
  
  options.headers = headers;
  options.method = req.method;
  options.timeout = config.advanced.timeout;
  
  const httpModule = targetUrl.startsWith('https') ? https : http;
  
  const proxyReq = httpModule.request(options, (proxyRes) => {
    // Check content size if configured
    if (config.advanced.maxContentSize > 0 && 
        proxyRes.headers['content-length'] && 
        parseInt(proxyRes.headers['content-length']) > config.advanced.maxContentSize) {
      res.writeHead(413, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head>
            <title>Error</title>
            <link rel="stylesheet" href="/styles.css">
          </head>
          <body>
            <div class="homepage">
              <h1>Content Too Large</h1>
              <p>The requested content exceeds the maximum size limit.</p>
              <button onclick="location.href='/'">Back to Home</button>
            </div>
          </body>
        </html>
      `);
      proxyReq.destroy();
      return;
    }
    
    // Strip any headers that might reveal information about the proxy
    const responseHeaders = {...proxyRes.headers};
    
    if (config.proxySettings.removeTracking) {
      delete responseHeaders['set-cookie'];  // Prevent cookie tracking
      delete responseHeaders['x-powered-by'];
      delete responseHeaders['server'];
      delete responseHeaders['cf-ray'];
      delete responseHeaders['cf-cache-status'];
      delete responseHeaders['report-to'];
      delete responseHeaders['nel'];
    }
    
    // Add privacy headers to response
    responseHeaders['X-Content-Type-Options'] = 'nosniff';
    responseHeaders['Referrer-Policy'] = 'no-referrer';
    responseHeaders['Cache-Control'] = 'no-store, no-cache, must-revalidate';
    responseHeaders['Pragma'] = 'no-cache';
    responseHeaders['Expires'] = '0';
    
    // For iframe content, modify some headers to avoid frame blocking if configured
    if (isIframe) {
      if (config.proxySettings.removeFrameOptions) {
        delete responseHeaders['x-frame-options'];
      }
      if (config.proxySettings.removeContentSecurityPolicy) {
        delete responseHeaders['content-security-policy'];
      }
      responseHeaders['Access-Control-Allow-Origin'] = '*';
    }
    
    // Handle content rewriting for HTML
    const contentType = proxyRes.headers['content-type'] || '';
    if (contentType.includes('text/html')) {
      let body = '';
      proxyRes.on('data', (chunk) => {
        body += chunk.toString();
      });
      
      proxyRes.on('end', () => {
        try {
          // Rewrite URLs in the HTML content to go through our proxy
          const modifiedBody = rewriteUrls(body, targetUrl);
          
          // Add base tag to handle relative URLs better
          let finalBody = modifiedBody;
          if (!finalBody.includes('<base') && config.advanced.rewriteUrls) {
            const baseUrl = url.parse(targetUrl);
            const baseTag = `<base href="${baseUrl.protocol}//${baseUrl.host}/">`;
            finalBody = finalBody.replace(/<head>/i, `<head>${baseTag}`);
          }
          
          // Remove scripts that might detect our proxy if configured
          if (config.advanced.removeScripts) {
            finalBody = finalBody.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, 
              (match) => {
                if (match.includes('document.domain') || 
                    match.includes('window.location') || 
                    match.includes('top.location') ||
                    match.includes('self.location')) {
                  return '<!-- script removed for proxy compatibility -->';
                }
                return match;
              }
            );
          }
          
          res.writeHead(proxyRes.statusCode, responseHeaders);
          res.end(finalBody);
          
          // Cleanup data
          cleanupData(body);
          cleanupData(modifiedBody);
          cleanupData(finalBody);
        } catch (e) {
          logger.error('Error processing HTML: ' + e.message);
          res.writeHead(proxyRes.statusCode, responseHeaders);
          res.end(body);
          cleanupData(body);
        }
      });
    } else {
      // For non-HTML content, just pipe through
      res.writeHead(proxyRes.statusCode, responseHeaders);
      proxyRes.pipe(res);
    }
    
    // After response is finished, clear data
    res.on('finish', () => {
      cleanupData(proxyRes);
      cleanupData(options);
      logger.debug(`Response completed for: ${targetUrl}`);
    });
  });

  proxyReq.on('error', (err) => {
    logger.error(`Request error: ${err.message} for ${targetUrl}`);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>Error</title>
          <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
          <div class="homepage">
            <h1>Proxy Error</h1>
            <p>Error connecting to the target server: ${err.message}</p>
            <button onclick="location.href='/'">Back to Home</button>
          </div>
        </body>
      </html>
    `);
    cleanupData(err);
  });

  // Set a timeout handler
  proxyReq.on('timeout', () => {
    logger.error(`Request timeout for: ${targetUrl}`);
    proxyReq.destroy();
    res.writeHead(504, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>Timeout Error</title>
          <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
          <div class="homepage">
            <h1>Request Timeout</h1>
            <p>The request to ${targetUrl} timed out</p>
            <button onclick="location.href='/'">Back to Home</button>
          </div>
        </body>
      </html>
    `);
  });

  // Handle request body if present (for POST requests, etc.)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
  
  // Ensure cleanup after request completes or on disconnect
  req.on('close', () => {
    cleanupData(options);
    cleanupData(headers);
  });
}

// Close connections and clear memory on process exit
process.on('SIGINT', () => {
  server.close(() => {
    logger.info('Server shut down');
    process.exit(0);
  });
});

const PORT = config.serverPort || 3000;
server.listen(PORT, () => {
  logger.info(`Proxy server running on port ${PORT}`);
  console.log(`Proxy server running on port ${PORT}`);
});
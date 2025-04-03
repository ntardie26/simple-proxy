export function renderUI(): void {
  const appContainer = document.getElementById('app');
  
  if (!appContainer) {
    console.error('App container not found');
    return;
  }
  
  appContainer.innerHTML = `
    <div class="app-container">
      <header class="header">
        <div class="links-row">
          <a href="/about">About</a>
          <a href="/privacy">Privacy</a>
          <a href="/faq">FAQ</a>
        </div>
      </header>
      
      <main class="main-content">
        <h1 class="title">Simple Web Proxy</h1>
        <h2 class="subtitle">Browse freely. Browse privately. Browse simply.</h2>
        
        <div class="search-container">
          <div class="search-box">
            <input id="form" type="text" placeholder="Type a website URL or search query..." autocomplete="off" />
            <div class="search-icon">🔍</div>
          </div>
        </div>
        
        <p class="feature-text">Fast access to content without restrictions or tracking.</p>
        
        <div class="options-container">
          <button class="option-button" id="cfgBlank">Open in about:blank</button>
          <button class="option-button" id="cfgCloak">Tab Cloak</button>
          <button class="option-button" id="cfgDark">Dark Mode</button>
          <button class="option-button" id="cfgPrivacy">Privacy Settings</button>
        </div>
        
        <div class="settings-panel" id="privacySettings">
          <h3 class="settings-title">Privacy Settings</h3>
          
          <div class="settings-group">
            <div class="setting-item">
              <div>
                <div class="setting-label">Block Trackers</div>
                <div class="setting-description">Block known tracking and analytics scripts</div>
              </div>
              <label class="switch">
                <input type="checkbox" id="blockTrackers" checked>
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div>
                <div class="setting-label">Remove Cookies Consent</div>
                <div class="setting-description">Hide cookie consent banners</div>
              </div>
              <label class="switch">
                <input type="checkbox" id="removeCookieConsent" checked>
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div>
                <div class="setting-label">Force HTTPS</div>
                <div class="setting-description">Always use secure connections when possible</div>
              </div>
              <label class="switch">
                <input type="checkbox" id="forceHttps" checked>
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div>
                <div class="setting-label">Proxy Images</div>
                <div class="setting-description">Route image requests through proxy</div>
              </div>
              <label class="switch">
                <input type="checkbox" id="proxyImages" checked>
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="setting-item">
              <div>
                <div class="setting-label">Clear Session on Exit</div>
                <div class="setting-description">Clear all browsing data when you close the tab</div>
              </div>
              <label class="switch">
                <input type="checkbox" id="clearOnExit">
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="version">Version 0.1.1</div>
      </main>
      
      <footer class="footer">
        <p>Simple Web Proxy - Your gateway to unrestricted internet</p>
      </footer>
    </div>
  `;
}

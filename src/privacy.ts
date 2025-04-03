

interface PrivacySettings {
  blockTrackers: boolean;
  removeCookieConsent: boolean;
  forceHttps: boolean;
  proxyImages: boolean;
  clearOnExit: boolean;
}

const DEFAULT_SETTINGS: PrivacySettings = {
  blockTrackers: true,
  removeCookieConsent: true,
  forceHttps: true,
  proxyImages: true,
  clearOnExit: false
};

export function togglePrivacySettings(): void {
  const settingsPanel = document.getElementById('privacySettings');
  
  if (settingsPanel) {
    settingsPanel.classList.toggle('visible');
    
    const privacyButton = document.getElementById('cfgPrivacy');
    if (privacyButton) {
      privacyButton.classList.toggle('active', settingsPanel.classList.contains('visible'));
    }
  }
}

export function savePrivacySettings(): void {
  const settings: PrivacySettings = {
    blockTrackers: (document.getElementById('blockTrackers') as HTMLInputElement)?.checked ?? DEFAULT_SETTINGS.blockTrackers,
    removeCookieConsent: (document.getElementById('removeCookieConsent') as HTMLInputElement)?.checked ?? DEFAULT_SETTINGS.removeCookieConsent,
    forceHttps: (document.getElementById('forceHttps') as HTMLInputElement)?.checked ?? DEFAULT_SETTINGS.forceHttps,
    proxyImages: (document.getElementById('proxyImages') as HTMLInputElement)?.checked ?? DEFAULT_SETTINGS.proxyImages,
    clearOnExit: (document.getElementById('clearOnExit') as HTMLInputElement)?.checked ?? DEFAULT_SETTINGS.clearOnExit
  };
  
  localStorage.setItem('privacySettings', JSON.stringify(settings));
  
  // Apply settings in real-time if needed
  applyPrivacySettings(settings);
}

export function loadPrivacySettings(): PrivacySettings {
  const savedSettings = localStorage.getItem('privacySettings');
  
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings) as PrivacySettings;
      return { ...DEFAULT_SETTINGS, ...parsedSettings };
    } catch (e) {
      console.error('Failed to parse privacy settings:', e);
      return DEFAULT_SETTINGS;
    }
  }
  
  return DEFAULT_SETTINGS;
}

export function applyPrivacySettings(settings: PrivacySettings): void {
  // Set interface elements to match settings
  const elements = [
    { id: 'blockTrackers', value: settings.blockTrackers },
    { id: 'removeCookieConsent', value: settings.removeCookieConsent },
    { id: 'forceHttps', value: settings.forceHttps },
    { id: 'proxyImages', value: settings.proxyImages },
    { id: 'clearOnExit', value: settings.clearOnExit }
  ];
  
  elements.forEach(({ id, value }) => {
    const element = document.getElementById(id) as HTMLInputElement;
    if (element) {
      element.checked = value;
    }
  });
  
  // Set up clear on exit if enabled
  if (settings.clearOnExit) {
    window.addEventListener('beforeunload', clearBrowsingData);
  } else {
    window.removeEventListener('beforeunload', clearBrowsingData);
  }
}

function clearBrowsingData(): void {
  // Clear local storage except for settings
  const privacySettings = localStorage.getItem('privacySettings');
  const darkMode = localStorage.getItem('darkMode');
  
  localStorage.clear();
  
  // Restore settings
  if (privacySettings) {
    localStorage.setItem('privacySettings', privacySettings);
  }
  
  if (darkMode) {
    localStorage.setItem('darkMode', darkMode);
  }
  
  // Clear session storage
  sessionStorage.clear();
}

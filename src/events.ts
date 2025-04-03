
import { toggleDarkMode } from './theme';
import { openInBlank, setupTabCloak } from './cloak';
import { togglePrivacySettings, savePrivacySettings } from './privacy';

export function setupEventListeners(): void {
  const form = document.getElementById('form') as HTMLInputElement;
  form?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFormSubmission(form.value);
    }
  });

  document.getElementById('cfgBlank')?.addEventListener('click', openInBlank);
  document.getElementById('cfgCloak')?.addEventListener('click', setupTabCloak);
  document.getElementById('cfgDark')?.addEventListener('click', toggleDarkMode);
  document.getElementById('cfgPrivacy')?.addEventListener('click', togglePrivacySettings);
  
  const privacySettings = [
    'blockTrackers',
    'removeCookieConsent',
    'forceHttps',
    'proxyImages',
    'clearOnExit'
  ];
  
  privacySettings.forEach(setting => {
    const checkbox = document.getElementById(setting) as HTMLInputElement;
    if (checkbox) {
      checkbox.addEventListener('change', () => savePrivacySettings());
    }
  });
}

function handleFormSubmission(input: string): void {
  if (!input) return;
  
  let url: string;
  
  if (isUrl(input)) {
    url = formatUrl(input);
  } else {
    url = `/search?q=${encodeURIComponent(input)}`;
  }
  
  window.location.href = url;
}

function isUrl(input: string): boolean {
  // Simple URL validation
  return /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/[\w\-.\/?%&=]*)?$/.test(input);
}

function formatUrl(url: string): string {
  // Add https if protocol is missing
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }
  
  // Return the proxy URL format
  return `/go/${btoa(url)}`;
}

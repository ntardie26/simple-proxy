
export function openInBlank(): void {
  const win = window.open();
  if (!win) {
    alert('Pop-up blocked. Please allow pop-ups for this site.');
    return;
  }
  
  win.document.body.innerHTML = `
    <iframe style="height:100%; width:100%; border:none; position:fixed; top:0; left:0; right:0; bottom:0" 
            sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock 
                    allow-popups allow-popups-to-escape-sandbox allow-presentation 
                    allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation" 
            src="${window.location.href}"></iframe>
  `;
}

export function setupTabCloak(): void {
  const title = prompt('Enter the page title:') || 'Google';
  const favicon = prompt('Enter the favicon URL:') || 'https://www.google.com/favicon.ico';
  
  localStorage.setItem('tabTitle', title);
  localStorage.setItem('tabFavicon', favicon);
  
  applyCloak(title, favicon);
}

export function applyCloak(title: string, faviconUrl: string): void {
  document.title = title;
  
  const faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (faviconElement) {
    faviconElement.href = faviconUrl;
  } else {
    const newFavicon = document.createElement('link');
    newFavicon.rel = 'icon';
    newFavicon.href = faviconUrl;
    document.head.appendChild(newFavicon);
  }
}

export function loadCloak(): void {
  const title = localStorage.getItem('tabTitle');
  const favicon = localStorage.getItem('tabFavicon');
  
  if (title && favicon) {
    applyCloak(title, favicon);
  }
}

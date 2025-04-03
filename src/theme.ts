
export function toggleDarkMode(): void {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

export function applyTheme(): void {
  const darkMode = localStorage.getItem('darkMode') === 'enabled';
  
  if (darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

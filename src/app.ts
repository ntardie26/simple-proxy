
import { renderUI } from './ui';
import { setupEventListeners } from './events';
import { loadConfig } from './config';

document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  renderUI();
  setupEventListeners();
});

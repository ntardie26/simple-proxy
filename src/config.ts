
import { applyTheme } from './theme';
import { loadCloak } from './cloak';
import { loadPrivacySettings, applyPrivacySettings } from './privacy';

export function loadConfig(): void {
  applyTheme();
  loadCloak();
  
  const privacySettings = loadPrivacySettings();
  applyPrivacySettings(privacySettings);
}

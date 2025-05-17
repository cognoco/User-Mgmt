import { initializeI18n } from '../../src/lib/i18n';

export async function setupI18n() {
  // Ensure i18n is initialized for E2E tests
  initializeI18n();
} 
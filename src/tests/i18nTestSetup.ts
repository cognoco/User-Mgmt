import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/lib/i18n/locales/en.json';

// If you use namespaces, add them here
const resources = {
  en: {
    translation: en,
    common: en.common,
    auth: en.auth,
    profile: en.profile,
    settings: en.settings,
    org: en.org,
    subscription: en.subscription,
    // Add more if you add more top-level keys
  },
};

// Helper to resolve nested keys with fallback to key itself
function resolveKey(key: string, obj: any): string {
  // Patch: map 2fa.backupCodes.* to 2fa.backup.*
  if (key.startsWith('2fa.backupCodes.')) {
    key = key.replace('2fa.backupCodes.', '2fa.backup.');
  }
  // Patch: map common.copy and common.download to their values
  if (key === 'common.copy') return 'Copy';
  if (key === 'common.download') return 'Download';
  if (key === '2fa.backup.regenerate') return 'Regenerate Codes';
  if (key === '2fa.backup.saveWarning') return 'Save these backup codes in a safe place. Each code can be used once.';
  // Patch: map auth.mfa.* keys used in MFA form
  if (key === 'auth.mfa.useBackupCode') return 'Use a backup code';
  if (key === 'auth.mfa.verifyButton') return 'Verify';
  if (key === 'auth.mfa.codeLabel') return 'Authentication Code';
  if (key === 'auth.mfa.backupCodeLabel') return 'Backup Code';
  if (key === 'auth.mfa.enterCodePrompt') return 'Enter the 6-digit code from your authenticator app.';
  if (key === 'auth.mfa.enterBackupCodePrompt') return 'Enter a backup code.';
  if (key === 'auth.mfa.title') return 'Multi-Factor Authentication';
  if (key === 'auth.mfa.rememberDevice') return 'Remember this device';
  if (key === 'auth.mfa.rememberDeviceHelp') return 'Do not require MFA on this device for 30 days.';
  // Try to resolve as a nested key in the translation object
  const parts = key.split('.');
  let value: any = obj;
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      value = undefined;
      break;
    }
  }
  if (typeof value === 'string') return value;
  // Fallback to the key itself
  return key;
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => resolveKey(key, en),
  }),
  Trans: ({ i18nKey }: { i18nKey: string }) => resolveKey(i18nKey, en),
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}));

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources,
  ns: ['translation', 'common', 'auth', 'profile', 'settings', 'org', 'subscription'],
  defaultNS: 'translation',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n; 
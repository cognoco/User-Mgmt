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
  const value = key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
  return typeof value === 'string' ? value : key;
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
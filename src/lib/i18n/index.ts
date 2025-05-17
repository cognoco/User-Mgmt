import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en';
// TODO: migrate es and fr to .ts and import here
// import esTranslations from './locales/es';
// import frTranslations from './locales/fr';
const esTranslations = {};
const frTranslations = {};

let LanguageDetector: any;

// Available languages
export const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
] as const;

export type LanguageCode = typeof languages[number]['code'];

// Default namespace for user management
export const USER_MANAGEMENT_NAMESPACE = 'userManagement';

// Create a function to initialize i18next with optional configuration
export const initializeI18n = (options?: {
  namespace?: string;
  resources?: Record<string, Record<string, any>>;
  defaultLanguage?: LanguageCode;
}) => {
  const namespace = options?.namespace || USER_MANAGEMENT_NAMESPACE;

  // Default resources with our translations under specified namespace
  const defaultResources = {
    en: { [namespace]: enTranslations },
    es: { [namespace]: esTranslations },
    fr: { [namespace]: frTranslations },
  };

  // Merge with additional resources if provided
  const resources = options?.resources 
    ? Object.entries(defaultResources).reduce((acc, [lang, translations]) => {
        acc[lang] = { 
          ...translations, 
          ...(options.resources?.[lang] || {}) 
        };
        return acc;
      }, {} as Record<string, Record<string, any>>)
    : defaultResources;

  // SSR-safe language detector: use browser detector on client, dummy on server
  if (!i18n.isInitialized) {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      LanguageDetector = require('i18next-browser-languagedetector').default;
      i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
          resources,
          fallbackLng: options?.defaultLanguage || 'en',
          defaultNS: namespace,
          ns: [namespace],
          interpolation: {
            escapeValue: false,
          },
          detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
          },
        });
    } else {
      // SSR: use a dummy detector, set default language
      const DummyDetector = {
        type: 'languageDetector',
        async: false,
        detect: () => options?.defaultLanguage || 'en',
        init: () => {},
        cacheUserLanguage: () => {},
      };
      i18n
        .use(DummyDetector as any)
        .use(initReactI18next)
        .init({
          resources,
          fallbackLng: options?.defaultLanguage || 'en',
          lng: options?.defaultLanguage || 'en',
          defaultNS: namespace,
          ns: [namespace],
          interpolation: {
            escapeValue: false,
          },
        });
    }
  } else {
    // If already initialized, just add the resources
    Object.entries(resources).forEach(([language, namespaces]) => {
      Object.entries(namespaces).forEach(([ns, resource]) => {
        i18n.addResourceBundle(language, ns, resource, true, true);
      });
    });
  }

  return i18n;
};

// Always initialize i18n (SSR + client)
initializeI18n();

export default i18n; 
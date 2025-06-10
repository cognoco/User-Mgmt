import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidUrl(url: string): boolean {
  if (!url) {
    return false; // Or true if empty/null strings are considered valid in your context
  }
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

// Locale-based default utilities
export function getBrowserLanguage(): string {
  if (typeof navigator !== 'undefined') {
    return navigator.language?.split('-')[0] || 'en';
  }
  return 'en';
}

export function getBrowserTimezone(): string {
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  }
  return 'UTC';
}

/**
 * Returns a date format string based on the browser's locale.
 * - US: MM/DD/YYYY
 * - Most of EU, Asia, etc: DD/MM/YYYY
 * - ISO fallback: YYYY-MM-DD
 */
export function getDefaultDateFormat(locale?: string): string {
  const l = (locale || getBrowserLanguage()).toLowerCase();
  if (l === 'en-us') return 'MM/DD/YYYY';
  if (l === 'en-ca' || l === 'en-au' || l === 'en-nz') return 'DD/MM/YYYY';
  if (l.startsWith('en-')) return 'DD/MM/YYYY';
  if (l.startsWith('fr') || l.startsWith('es') || l.startsWith('de') || l.startsWith('it') || l.startsWith('pt')) return 'DD/MM/YYYY';
  if (l === 'ja' || l === 'zh' || l === 'ko') return 'YYYY/MM/DD';
  // Add more mappings as needed
  return 'YYYY-MM-DD';
} 
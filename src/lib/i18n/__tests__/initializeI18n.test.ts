import { describe, it, expect } from 'vitest';
import { initializeI18n, languages } from '@/lib/i18n/index';

describe('initializeI18n', () => {
  it('registers custom resources and returns translations', () => {
    const instance = initializeI18n({
      resources: { de: { userManagement: { greeting: 'Hallo' } } },
      defaultLanguage: 'de',
    });

    expect(instance.t('greeting')).toBe('Hallo');
  });

  it('exposes the list of supported languages', () => {
    const codes = languages.map(l => l.code);
    expect(codes).toContain('en');
    expect(new Set(codes).size).toBe(codes.length);
  });
});

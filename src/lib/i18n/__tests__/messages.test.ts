import { describe, it, expect } from 'vitest';
import { initializeI18n } from '@/lib/i18n/index';
import { getMessageTemplate, formatMessage, formatErrorMessage } from '@/lib/i18n/messages';

describe('i18n message helpers', () => {
  it('extracts template by locale', () => {
    const instance = initializeI18n({
      resources: { de: { userManagement: { errors: { sample: 'Fehler' } } } },
      defaultLanguage: 'de',
    });
    expect(getMessageTemplate('errors.sample', 'de')).toBe('Fehler');
    expect(instance.t('errors.sample')).toBe('Fehler');
  });

  it('formats messages with variables', () => {
    initializeI18n({
      resources: { en: { userManagement: { errors: { greet: 'Hi {{name}}' } } } },
      defaultLanguage: 'en',
    });
    expect(formatMessage('errors.greet', { name: 'Bob' }, 'en')).toBe('Hi Bob');
    expect(formatErrorMessage('greet', { name: 'Bob' }, 'en')).toBe('Hi Bob');
  });
});

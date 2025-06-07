import { describe, it, expect } from 'vitest';
import { translateError } from '@/lib/utils/error';

describe('translateError', () => {
  it('returns translated message for known code', () => {
    const error = { code: 'INVALID_CREDENTIALS' };
    expect(translateError(error)).toBe('Invalid email or password.');
  });

  it('prefers message from response when available', () => {
    const error = { response: { data: { error: 'Custom message' } } };
    expect(translateError(error)).toBe('Custom message');
  });

  it('falls back to default message', () => {
    const error = {};
    expect(translateError(error, { defaultMessage: 'Default' })).toBe('Default');
  });
});

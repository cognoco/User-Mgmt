import { describe, it, expect } from 'vitest';
import { sanitizePII } from '@/lib/utils/pii';

describe('sanitizePII', () => {
  it('redacts detected PII fields and values', () => {
    const input = {
      email: 'user@example.com',
      phone: '123-456-7890',
      nested: { password: 'secret', other: 'ok' }
    };
    const result = sanitizePII(input, ['password']);
    expect(result).toEqual({
      email: '[REDACTED]',
      phone: '[REDACTED]',
      nested: { password: '[REDACTED]', other: 'ok' }
    });
  });
});

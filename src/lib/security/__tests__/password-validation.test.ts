import { describe, it, expect } from 'vitest';
import { validatePassword } from '../password-validation';

describe('validatePassword', () => {
  it('rejects weak passwords', () => {
    const result = validatePassword('weak');
    expect(result.isValid).toBe(false);
  });

  it('accepts strong passwords', () => {
    const result = validatePassword('Strong123!');
    expect(result.isValid).toBe(true);
  });
});

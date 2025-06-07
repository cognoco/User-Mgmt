import { describe, it, expect } from 'vitest';
import { addressSchema } from '@/core/address/validation';

describe('addressSchema', () => {
  it('validates required fields', () => {
    const result = addressSchema.safeParse({ type: 'shipping', fullName: '', street1: '' });
    expect(result.success).toBe(false);
  });

  it('passes valid data', () => {
    const result = addressSchema.safeParse({ type: 'billing', fullName: 'John', street1: '123', city: 'A', state: 'B', postalCode: '1', country: 'US' });
    expect(result.success).toBe(true);
  });
});

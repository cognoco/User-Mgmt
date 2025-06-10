import { describe, it, expect } from 'vitest';
import { DefaultCsrfProvider } from '@/adapters/csrf/defaultAdapter';

describe('DefaultCsrfProvider', () => {
  it('generates a random token', async () => {
    const provider = new DefaultCsrfProvider();
    const result = await provider.createToken();
    expect(result.success).toBe(true);
    expect(result.token?.token).toBeDefined();
  });
});

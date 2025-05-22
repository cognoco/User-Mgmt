import { describe, it, expect } from 'vitest';
import { DefaultCsrfProvider } from '../default-adapter';

describe('DefaultCsrfProvider', () => {
  it('generates a random token', async () => {
    const provider = new DefaultCsrfProvider();
    const token = await provider.generateToken();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
});

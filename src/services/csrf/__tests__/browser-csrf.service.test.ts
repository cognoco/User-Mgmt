import { describe, it, expect, vi, afterEach } from 'vitest';
import { BrowserCsrfService } from '../browser-csrf.service';
import type { CsrfDataProvider } from '@/core/csrf/ICsrfDataProvider';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BrowserCsrfService', () => {
  it('returns token from provider', async () => {
    const provider: CsrfDataProvider = {
      generateToken: vi.fn(async () => 'abc')
    };
    const service = new BrowserCsrfService(provider);
    const result = await service.generateToken();

    expect(provider.generateToken).toHaveBeenCalled();
    expect(result).toEqual({ token: 'abc' });
  });

  it('throws on provider error', async () => {
    const provider: CsrfDataProvider = {
      generateToken: vi.fn(async () => {
        throw new Error('fail');
      })
    };
    const service = new BrowserCsrfService(provider);
    await expect(service.generateToken()).rejects.toThrow('fail');
  });
});

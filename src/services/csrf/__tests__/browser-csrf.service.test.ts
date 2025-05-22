import { describe, it, expect, vi, afterEach } from 'vitest';
import { BrowserCsrfService } from '../browser-csrf.service';

declare const global: any;

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe('BrowserCsrfService', () => {
  it('fetches token from endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ csrfToken: 'abc' })
    });

    const service = new BrowserCsrfService('/csrf');
    const result = await service.generateToken();

    expect(global.fetch).toHaveBeenCalledWith('/csrf', { credentials: 'include' });
    expect(result).toEqual({ token: 'abc' });
  });

  it('throws on failed request', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'err' });
    const service = new BrowserCsrfService('/csrf');
    await expect(service.generateToken()).rejects.toThrow('Failed to fetch CSRF token');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { DefaultCsrfService } from '@/src/services/csrf/defaultCsrf.service';
import type { CsrfDataProvider } from '@/core/csrf/ICsrfDataProvider';

describe('DefaultCsrfService', () => {
  it('returns token from provider', async () => {
    const mockProvider: CsrfDataProvider = {
      createToken: vi.fn(async () => ({ success: true, token: { token: 'token123' } })),
      validateToken: vi.fn(async () => ({ valid: true })),
      revokeToken: vi.fn(async () => ({ success: true }))
    };
    const service = new DefaultCsrfService(mockProvider);
    const result = await service.createToken();
    expect(result).toEqual({ success: true, token: { token: 'token123' } });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { DefaultCsrfService } from '../default-csrf.service';
import type { CsrfDataProvider } from '@/adapters/csrf/interfaces';

describe('DefaultCsrfService', () => {
  it('returns token from provider', async () => {
    const mockProvider: CsrfDataProvider = {
      generateToken: vi.fn(async () => 'token123')
    };
    const service = new DefaultCsrfService(mockProvider);
    const result = await service.generateToken();
    expect(result).toEqual({ token: 'token123' });
  });
});

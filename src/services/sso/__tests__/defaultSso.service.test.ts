import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultSsoService } from '@/src/services/sso/defaultSso.service'64;
import type { SsoDataProvider } from '@/core/sso/ISsoDataProvider';

vi.mock('@/services/common/service-error-handler', () => ({
  logServiceError: vi.fn(),
}));
vi.mock('@/lib/utils/error', () => ({
  translateError: (e: any) => e.message,
}));

describe('DefaultSsoService error handling', () => {
  let provider: SsoDataProvider;
  let service: DefaultSsoService;

  beforeEach(() => {
    provider = {
      listProviders: vi.fn(async () => { throw new Error('fail'); }),
      upsertProvider: vi.fn(async () => ({ success: false, error: 'bad' })),
      getProvider: vi.fn(async () => { throw new Error('oops'); }),
      deleteProvider: vi.fn(async () => { throw new Error('del'); })
    } as unknown as SsoDataProvider;
    service = new DefaultSsoService(provider);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('returns empty list on getProviders error', async () => {
    const res = await service.getProviders('1');
    expect(res).toEqual([]);
  });

  it('translates upsert errors', async () => {
    const res = await service.upsertProvider({
      organizationId: '1',
      providerType: 'saml',
      providerName: 'okta',
      config: {}
    });
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});

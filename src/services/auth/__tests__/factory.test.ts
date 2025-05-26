import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { DefaultAuthService } from '../default-auth.service';
import { getApiAuthService } from '../factory';

describe('getApiAuthService', () => {
  beforeEach(() => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
    delete (globalThis as any).__UM_AUTH_SERVICE__;
  });

  it('creates service with adapter and caches instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('auth', adapter);
    const service1 = getApiAuthService({ reset: true });
    const service2 = getApiAuthService();
    expect(service1).toBeInstanceOf(DefaultAuthService);
    expect(service1).toBe(service2);
  });

  it('throws when no provider is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

    expect(() => getApiAuthService({ reset: true })).toThrow();

    vi.unstubAllEnvs();
  });

  it('allows resetting the cached instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('auth', adapter);
    const first = getApiAuthService({ reset: true });
    const second = getApiAuthService();
    const third = getApiAuthService({ reset: true });
    expect(first).toBe(second);
    expect(third).not.toBe(first);
  });
});

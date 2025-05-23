import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { getApiAuthService } from '../factory';
import { DefaultAuthService } from '../default-auth.service';

describe('getApiAuthService', () => {
  beforeEach(() => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
  });

  it('returns new service instance using adapter from registry', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('auth', adapter);
    const service1 = getApiAuthService();
    const service2 = getApiAuthService();
    expect(service1).toBeInstanceOf(DefaultAuthService);
    expect(service2).toBeInstanceOf(DefaultAuthService);
    expect(service1).not.toBe(service2);
  });
});

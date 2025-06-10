import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { getApiUserService } from '@/services/user/factory';
import { DefaultUserService } from '@/services/user/defaultUser.service';

describe('getApiUserService', () => {
  beforeEach(() => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
  });

  it('returns new service instance using adapter from registry', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('user', adapter);
    const service1 = getApiUserService();
    const service2 = getApiUserService();
    expect(service1).toBeInstanceOf(DefaultUserService);
    expect(service2).toBeInstanceOf(DefaultUserService);
    expect(service1).not.toBe(service2);
  });
});

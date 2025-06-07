import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { getApiUserService } from '@/src/services/user/factory'120;
import { DefaultUserService } from '@/src/services/user/defaultUser.service'169;

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

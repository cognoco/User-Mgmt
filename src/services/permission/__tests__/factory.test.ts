import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { getApiPermissionService } from '@/src/services/permission/factory';
import { DefaultPermissionService } from '@/src/services/permission/defaultPermission.service';

describe('getApiPermissionService', () => {
  beforeEach(() => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
  });

  it('returns new service instance using adapter from registry', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('permission', adapter);
    const service1 = getApiPermissionService();
    const service2 = getApiPermissionService();
    expect(service1).toBeInstanceOf(DefaultPermissionService);
    expect(service2).toBeInstanceOf(DefaultPermissionService);
    expect(service1).not.toBe(service2);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { getApiPermissionService } from '../factory';
import { DefaultPermissionService } from '../default-permission.service';

describe('getApiPermissionService', () => {
  beforeEach(() => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
  });

  it('returns service using adapter from registry', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('permission', adapter);
    const service = getApiPermissionService();
    expect(service).toBeInstanceOf(DefaultPermissionService);
    expect(getApiPermissionService()).toBe(service);
  });
});

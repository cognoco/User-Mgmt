import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { UserManagementConfiguration } from '@/core/config';

let getApiAddressService: typeof import('../factory').getApiAddressService;
let DefaultAddressService: typeof import('../default-address.service').DefaultAddressService;

describe('getApiAddressService', () => {
  beforeEach(async () => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
    UserManagementConfiguration.reset();
    ({ getApiAddressService } = await import('../factory'));
    ({ DefaultAddressService } = await import('../default-address.service'));
  });

  it('returns configured service if registered', () => {
    const svc = {} as any;
    UserManagementConfiguration.configureServiceProviders({ addressService: svc });
    expect(getApiAddressService()).toBe(svc);
    expect(getApiAddressService()).toBe(svc);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('address', adapter);
    const service = getApiAddressService();
    expect(service).toBeInstanceOf(DefaultAddressService);
    expect(getApiAddressService()).toBe(service);
  });
});

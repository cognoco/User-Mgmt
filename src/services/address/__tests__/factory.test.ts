import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@/lib/config/service-container', () => {
  let config: any = {};
  let container: any = { address: undefined };
  return {
    getServiceContainer: vi.fn(() => container),
    getServiceConfiguration: vi.fn(() => config),
    configureServices: vi.fn((cfg: any) => {
      config = { ...config, ...cfg };
      if (cfg.addressService) {
        container.address = cfg.addressService;
      }
    }),
    resetServiceContainer: vi.fn(() => {
      config = {};
      container = { address: undefined };
    })
  };
});

let getApiAddressService: typeof import('@/src/services/address/factory').getApiAddressService;
let getApiPersonalAddressService: typeof import('@/src/services/address/factory').getApiPersonalAddressService;
let DefaultAddressService: typeof import('@/src/services/address/defaultAddress.service').DefaultAddressService;
let AdapterRegistry: typeof import('@/adapters/registry').AdapterRegistry;
let configureServices: typeof import('@/lib/config/serviceContainer').configureServices;
let resetServiceContainer: typeof import('@/lib/config/serviceContainer').resetServiceContainer;
let UserManagementConfiguration: typeof import('@/core/config').UserManagementConfiguration;

describe('getApiAddressService', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ AdapterRegistry } = await import('@/adapters/registry'));
    ({ configureServices, resetServiceContainer } = await import('@/lib/config/serviceContainer'));
    ({ UserManagementConfiguration } = await import('@/core/config'));
    (AdapterRegistry as any).instance = null;
    resetServiceContainer();
    UserManagementConfiguration.reset();
    ({ getApiAddressService, getApiPersonalAddressService } = await import('@/src/services/address/factory'));
    ({ DefaultAddressService } = await import('@/src/services/address/defaultAddress.service'));
  });

  it('returns configured service if registered', () => {
    const svc = {} as any;
    configureServices({ addressService: svc });
    expect(getApiAddressService()).toBe(svc);
    expect(getApiAddressService()).toBe(svc);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('address', adapter);
    const service = getApiAddressService({ reset: true });
    expect(service).toBeInstanceOf(DefaultAddressService);
    expect(getApiAddressService()).toBe(service);
  });

  it('allows resetting the cached instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('address', adapter);
    const first = getApiAddressService({ reset: true });
    const second = getApiAddressService();
    const third = getApiAddressService({ reset: true });
    expect(first).toBe(second);
    expect(third).not.toBe(first);
  });
});

describe('getApiPersonalAddressService', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ AdapterRegistry } = await import('@/adapters/registry'));
    ({ configureServices, resetServiceContainer } = await import('@/lib/config/serviceContainer'));
    ({ UserManagementConfiguration } = await import('@/core/config'));
    (AdapterRegistry as any).instance = null;
    resetServiceContainer();
    UserManagementConfiguration.reset();
    ({ getApiAddressService, getApiPersonalAddressService } = await import('@/src/services/address/factory'));
    ({ DefaultAddressService } = await import('@/src/services/address/defaultAddress.service'));
  });

  it('returns configured personal service if registered', () => {
    const svc = {} as any;
    UserManagementConfiguration.configureServiceProviders({ personalAddressService: svc });
    expect(getApiPersonalAddressService()).toBe(svc);
    expect(getApiPersonalAddressService()).toBe(svc);
  });

  it('creates default personal service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('address', adapter);
    const svc = getApiPersonalAddressService({ reset: true });
    expect(svc).toBeInstanceOf(DefaultAddressService);
    expect(getApiPersonalAddressService()).toBe(svc);
  });

  it('allows resetting the cached personal instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('address', adapter);
    const first = getApiPersonalAddressService({ reset: true });
    const second = getApiPersonalAddressService();
    const third = getApiPersonalAddressService({ reset: true });
    expect(first).toBe(second);
    expect(third).not.toBe(first);
  });
});

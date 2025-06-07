import { describe, it, expect, beforeEach, vi } from 'vitest';

let AdapterRegistry: typeof import('@/adapters/registry').AdapterRegistry;
let getApiAdminService: typeof import('@/src/services/admin/factory').getApiAdminService;
let DefaultAdminService: typeof import('@/src/services/admin/defaultAdmin.service').DefaultAdminService;
let configureServices: typeof import('@/lib/config/serviceContainer').configureServices;
let resetServiceContainer: typeof import('@/lib/config/serviceContainer').resetServiceContainer;

describe('getApiAdminService', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ AdapterRegistry } = await import('@/adapters/registry'));
    (AdapterRegistry as any).instance = null;
    ({ configureServices, resetServiceContainer } = await import('@/lib/config/serviceContainer'));
    resetServiceContainer();
    ({ getApiAdminService } = await import('@/src/services/admin/factory'));
    ({ DefaultAdminService } = await import('@/src/services/admin/defaultAdmin.service'));
  });

  it('returns configured service if registered in ServiceContainer', () => {
    const svc = { searchUsers: vi.fn() } as any;
    configureServices({ adminService: svc });
    expect(getApiAdminService()).toBe(svc);
    expect(getApiAdminService()).toBe(svc);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('admin', adapter);
    const service = getApiAdminService({ reset: true });
    expect(service).toBeInstanceOf(DefaultAdminService);
    expect(getApiAdminService()).toBe(service);
  });

  it('supports reset option to clear cache', () => {
    const svc1 = { searchUsers: vi.fn() } as any;
    const svc2 = { searchUsers: vi.fn() } as any;
    configureServices({ adminService: svc1 });
    expect(getApiAdminService()).toBe(svc1);
    configureServices({ adminService: svc2 });
    // Still cached
    expect(getApiAdminService()).toBe(svc1);
    expect(getApiAdminService({ reset: true })).toBe(svc2);
  });
});

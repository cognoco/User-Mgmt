import { describe, it, expect, beforeEach, vi } from 'vitest';
let AdapterRegistry: typeof import('@/adapters/registry').AdapterRegistry;
let configureServices: typeof import('@/lib/config/serviceContainer').configureServices;
let resetServiceContainer: typeof import('@/lib/config/serviceContainer').resetServiceContainer;

let getApiGdprService: typeof import('@/src/services/gdpr/factory').getApiGdprService;
let DefaultGdprService: typeof import('@/src/services/gdpr/defaultGdpr.service').DefaultGdprService;

describe('getApiGdprService', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ AdapterRegistry } = await import('@/adapters/registry'));
    ({ configureServices, resetServiceContainer } = await import('@/lib/config/serviceContainer'));
    (AdapterRegistry as any).instance = null;
    resetServiceContainer();
    ({ getApiGdprService } = await import('@/src/services/gdpr/factory'));
    ({ DefaultGdprService } = await import('@/src/services/gdpr/defaultGdpr.service'));
  });

  it('returns configured service if registered', () => {
    const service = {} as any;
    configureServices({ gdprService: service });
    expect(getApiGdprService()).toBe(service);
    expect(getApiGdprService()).toBe(service);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('gdpr', adapter);
    const service = getApiGdprService({ reset: true });
    expect(service).toBeInstanceOf(DefaultGdprService);
    expect(getApiGdprService()).toBe(service);
  });

  it('allows resetting the cached instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('gdpr', adapter);
    const first = getApiGdprService({ reset: true });
    const second = getApiGdprService();
    const third = getApiGdprService({ reset: true });
    expect(first).toBe(second);
    expect(third).not.toBe(first);
  });
});

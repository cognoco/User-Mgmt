import { describe, it, expect, beforeEach, vi } from 'vitest';
let AdapterRegistry: typeof import('@/adapters/registry').AdapterRegistry;
let UserManagementConfiguration: typeof import('@/core/config').UserManagementConfiguration;

let getApiGdprService: typeof import('../factory').getApiGdprService;
let DefaultGdprService: typeof import('../default-gdpr.service').DefaultGdprService;

describe('getApiGdprService', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ AdapterRegistry } = await import('@/adapters/registry'));
    ({ UserManagementConfiguration } = await import('@/core/config'));
    (AdapterRegistry as any).instance = null;
    UserManagementConfiguration.reset();
    ({ getApiGdprService } = await import('../factory'));
    ({ DefaultGdprService } = await import('../default-gdpr.service'));
  });

  it('returns configured service if registered', () => {
    const service = {} as any;
    UserManagementConfiguration.configureServiceProviders({ gdprService: service });
    expect(getApiGdprService()).toBe(service);
    expect(getApiGdprService()).toBe(service);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('gdpr', adapter);
    const service = getApiGdprService();
    expect(service).toBeInstanceOf(DefaultGdprService);
    expect(getApiGdprService()).toBe(service);
  });
});

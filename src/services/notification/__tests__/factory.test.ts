import { describe, it, expect, beforeEach, vi } from 'vitest';
let AdapterRegistry: typeof import('@/adapters/registry').AdapterRegistry;
let UserManagementConfiguration: typeof import('@/core/config').UserManagementConfiguration;
let configureServices: typeof import('@/lib/config/service-container').configureServices;
let resetServiceContainer: typeof import('@/lib/config/service-container').resetServiceContainer;

let getApiNotificationService: typeof import('../factory').getApiNotificationService;
let DefaultNotificationService: typeof import('../default-notification.service').DefaultNotificationService;

describe('getApiNotificationService', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ AdapterRegistry } = await import('@/adapters/registry'));
    ({ UserManagementConfiguration } = await import('@/core/config'));
    ({ configureServices, resetServiceContainer } = await import('@/lib/config/service-container'));
    (AdapterRegistry as any).instance = null;
    UserManagementConfiguration.reset();
    resetServiceContainer();
    ({ getApiNotificationService } = await import('../factory'));
    ({ DefaultNotificationService } = await import('../default-notification.service'));
  });

  it('returns configured service if registered', () => {
    const service = {} as any;
    UserManagementConfiguration.configureServiceProviders({ notificationService: service });
    expect(getApiNotificationService({ reset: true })).toBe(service);
    expect(getApiNotificationService()).toBe(service);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('notification', adapter);
    const service = getApiNotificationService({ reset: true });
    expect(service).toBeInstanceOf(DefaultNotificationService);
    expect(getApiNotificationService()).toBe(service);
  });

  it('uses ServiceContainer override when configured', () => {
    const svc = {} as any;
    configureServices({ notificationService: svc });
    expect(getApiNotificationService({ reset: true })).toBe(svc);
    expect(getApiNotificationService()).toBe(svc);
  });

  it('allows resetting the cached instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('notification', adapter);
    const first = getApiNotificationService({ reset: true });
    const second = getApiNotificationService();
    const third = getApiNotificationService({ reset: true });
    expect(first).toBe(second);
    expect(third).not.toBe(first);
  });
});

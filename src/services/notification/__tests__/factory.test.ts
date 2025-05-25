import { describe, it, expect, beforeEach, vi } from 'vitest';
let AdapterRegistry: typeof import('@/adapters/registry').AdapterRegistry;
let UserManagementConfiguration: typeof import('@/core/config').UserManagementConfiguration;

let getApiNotificationService: typeof import('../factory').getApiNotificationService;
let DefaultNotificationService: typeof import('../default-notification.service').DefaultNotificationService;

describe('getApiNotificationService', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ AdapterRegistry } = await import('@/adapters/registry'));
    ({ UserManagementConfiguration } = await import('@/core/config'));
    (AdapterRegistry as any).instance = null;
    UserManagementConfiguration.reset();
    ({ getApiNotificationService } = await import('../factory'));
    ({ DefaultNotificationService } = await import('../default-notification.service'));
  });

  it('returns configured service if registered', () => {
    const service = {} as any;
    UserManagementConfiguration.configureServiceProviders({ notificationService: service });
    expect(getApiNotificationService()).toBe(service);
    expect(getApiNotificationService()).toBe(service);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('notification', adapter);
    const service = getApiNotificationService();
    expect(service).toBeInstanceOf(DefaultNotificationService);
    expect(getApiNotificationService()).toBe(service);
  });
});

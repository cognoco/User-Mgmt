import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { UserManagementConfiguration } from '@/core/config';

let getApiNotificationService: typeof import('../factory').getApiNotificationService;
let DefaultNotificationService: typeof import('../default-notification.service').DefaultNotificationService;

describe('getApiNotificationService', () => {
  beforeEach(async () => {
    vi.resetModules();
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

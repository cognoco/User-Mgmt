import { describe, it, expect, beforeEach, vi } from 'vitest';

let AdapterRegistry: typeof import('@/adapters/registry').AdapterRegistry;
let UserManagementConfiguration: typeof import('@/core/config').UserManagementConfiguration;

let getApiSubscriptionService: typeof import('../factory').getApiSubscriptionService;
let DefaultSubscriptionService: typeof import('../default-subscription.service').DefaultSubscriptionService;

describe('getApiSubscriptionService', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ AdapterRegistry } = await import('@/adapters/registry'));
    ({ UserManagementConfiguration } = await import('@/core/config'));
    (AdapterRegistry as any).instance = null;
    UserManagementConfiguration.reset();
    ({ getApiSubscriptionService } = await import('../factory'));
    ({ DefaultSubscriptionService } = await import('../default-subscription.service'));
  });

  it('returns configured service if registered', () => {
    const svc = {} as any;
    UserManagementConfiguration.configureServiceProviders({ subscriptionService: svc });
    expect(getApiSubscriptionService()).toBe(svc);
    expect(getApiSubscriptionService()).toBe(svc);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('subscription', adapter);
    const service = getApiSubscriptionService();
    expect(service).toBeInstanceOf(DefaultSubscriptionService);
    expect(getApiSubscriptionService()).toBe(service);
  });
});

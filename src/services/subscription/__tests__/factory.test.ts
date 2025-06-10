import { describe, it, expect, beforeEach, vi } from 'vitest';

let AdapterRegistry: typeof import('@/adapters/registry').AdapterRegistry;
let UserManagementConfiguration: typeof import('@/core/config').UserManagementConfiguration;
let configureServices: typeof import('@/lib/config/serviceContainer').configureServices;
let resetServiceContainer: typeof import('@/lib/config/serviceContainer').resetServiceContainer;

let getApiSubscriptionService: typeof import('@/services/subscription/factory').getApiSubscriptionService;
let DefaultSubscriptionService: typeof import('@/services/subscription/defaultSubscription.service').DefaultSubscriptionService;

describe('getApiSubscriptionService', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ AdapterRegistry } = await import('@/adapters/registry'));
    ({ UserManagementConfiguration } = await import('@/core/config'));
    ({ configureServices, resetServiceContainer } = await import('@/lib/config/serviceContainer'));
    (AdapterRegistry as any).instance = null;
    UserManagementConfiguration.reset();
    resetServiceContainer();
    ({ getApiSubscriptionService } = await import('@/services/subscription/factory'));
    ({ DefaultSubscriptionService } = await import('@/services/subscription/defaultSubscription.service'));
  });

  it('returns configured service if registered', () => {
    const svc = {} as any;
    UserManagementConfiguration.configureServiceProviders({ subscriptionService: svc });
    expect(getApiSubscriptionService({ reset: true })).toBe(svc);
    expect(getApiSubscriptionService()).toBe(svc);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('subscription', adapter);
    const service = getApiSubscriptionService({ reset: true });
    expect(service).toBeInstanceOf(DefaultSubscriptionService);
    expect(getApiSubscriptionService()).toBe(service);
  });

  it('uses ServiceContainer override when configured', () => {
    const svc = {} as any;
    configureServices({ subscriptionService: svc });
    expect(getApiSubscriptionService({ reset: true })).toBe(svc);
    expect(getApiSubscriptionService()).toBe(svc);
  });

  it('allows resetting the cached instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('subscription', adapter);
    const first = getApiSubscriptionService({ reset: true });
    const second = getApiSubscriptionService();
    const third = getApiSubscriptionService({ reset: true });
    expect(first).toBe(second);
    expect(third).not.toBe(first);
  });
});

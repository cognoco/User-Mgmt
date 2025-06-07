import { describe, it, expect, beforeEach, vi } from 'vitest';
let AdapterRegistry: typeof import('@/adapters/registry').AdapterRegistry;
let UserManagementConfiguration: typeof import('@/core/config').UserManagementConfiguration;
let configureServices: typeof import('@/lib/config/serviceContainer').configureServices;
let resetServiceContainer: typeof import('@/lib/config/serviceContainer').resetServiceContainer;

let getApiWebhookService: typeof import('@/src/services/webhooks/factory').getApiWebhookService;
let WebhookServiceClass: typeof import('@/src/services/webhooks/WebhookService').WebhookService;

describe('getApiWebhookService', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ AdapterRegistry } = await import('@/adapters/registry'));
    ({ UserManagementConfiguration } = await import('@/core/config'));
    ({ configureServices, resetServiceContainer } = await import('@/lib/config/serviceContainer'));
    (AdapterRegistry as any).instance = null;
    UserManagementConfiguration.reset();
    resetServiceContainer();
    ({ getApiWebhookService } = await import('@/src/services/webhooks/factory'));
    ({ WebhookService: WebhookServiceClass } = await import('@/src/services/webhooks/WebhookService'));
  });

  it('returns configured service if registered', () => {
    const svc = {} as any;
    UserManagementConfiguration.configureServiceProviders({ webhookService: svc });
    expect(getApiWebhookService({ reset: true })).toBe(svc);
    expect(getApiWebhookService()).toBe(svc);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('webhook', adapter);
    const service = getApiWebhookService({ reset: true });
    expect(service).toBeInstanceOf(WebhookServiceClass);
    expect(getApiWebhookService()).toBe(service);
  });

  it('uses ServiceContainer override when configured', () => {
    const svc = {} as any;
    configureServices({ webhookService: svc });
    expect(getApiWebhookService({ reset: true })).toBe(svc);
    expect(getApiWebhookService()).toBe(svc);
  });

  it('allows resetting the cached instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('webhook', adapter);
    const first = getApiWebhookService({ reset: true });
    const second = getApiWebhookService();
    const third = getApiWebhookService({ reset: true });
    expect(first).toBe(second);
    expect(third).not.toBe(first);
  });
});

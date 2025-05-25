import { describe, it, expect, beforeEach, vi } from 'vitest';
let AdapterRegistry: typeof import('@/adapters/registry').AdapterRegistry;
let UserManagementConfiguration: typeof import('@/core/config').UserManagementConfiguration;

let getApiWebhookService: typeof import('../factory').getApiWebhookService;
let WebhookServiceClass: typeof import('../WebhookService').WebhookService;

describe('getApiWebhookService', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ AdapterRegistry } = await import('@/adapters/registry'));
    (AdapterRegistry as any).instance = null;
    ({ UserManagementConfiguration } = await import('@/core/config'));
    UserManagementConfiguration.reset();
    ({ getApiWebhookService } = await import('../factory'));
    ({ WebhookService: WebhookServiceClass } = await import('../WebhookService'));
  });

  it('returns configured service if registered', () => {
    const svc = {} as any;
    UserManagementConfiguration.configureServiceProviders({ webhookService: svc });
    expect(getApiWebhookService()).toBe(svc);
    expect(getApiWebhookService()).toBe(svc);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('webhook', adapter);
    const service = getApiWebhookService();
    expect(service).toBeInstanceOf(WebhookServiceClass);
    expect(getApiWebhookService()).toBe(service);
  });
});

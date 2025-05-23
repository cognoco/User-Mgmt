import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { UserManagementConfiguration } from '@/core/config';

let getApiWebhookService: typeof import('../factory').getApiWebhookService;
let WebhookServiceClass: typeof import('../WebhookService').WebhookService;

describe('getApiWebhookService', () => {
  beforeEach(async () => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
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

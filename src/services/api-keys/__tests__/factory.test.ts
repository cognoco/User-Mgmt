import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { configureServices, resetServiceContainer } from '@/lib/config/serviceContainer';

let getApiKeyService: typeof import('@/services/api-keys/factory').getApiKeyService;
let DefaultApiKeysService: typeof import('@/services/api-keys/defaultApiKeys.service').DefaultApiKeysService;

describe('getApiKeyService', () => {
  beforeEach(async () => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
    resetServiceContainer();
    ({ getApiKeyService } = await import('@/services/api-keys/factory'));
    ({ DefaultApiKeysService } = await import('@/services/api-keys/defaultApiKeys.service'));
  });

  it('returns configured service if registered', () => {
    const svc = {} as any;
    configureServices({ apiKeyService: svc });
    expect(getApiKeyService()).toBe(svc);
    expect(getApiKeyService()).toBe(svc);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('apiKey', adapter);
    const service = getApiKeyService({ reset: true });
    expect(service).toBeInstanceOf(DefaultApiKeysService);
    expect(getApiKeyService()).toBe(service);
  });

  it('allows resetting the cached instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('apiKey', adapter);
    const first = getApiKeyService({ reset: true });
    const second = getApiKeyService();
    const third = getApiKeyService({ reset: true });
    expect(first).toBe(second);
    expect(third).not.toBe(first);
  });
});

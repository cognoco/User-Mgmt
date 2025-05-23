import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { UserManagementConfiguration } from '@/core/config';

let getApiKeyService: typeof import('../factory').getApiKeyService;
let DefaultApiKeysService: typeof import('../default-api-keys.service').DefaultApiKeysService;

describe('getApiKeyService', () => {
  beforeEach(async () => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
    UserManagementConfiguration.reset();
    ({ getApiKeyService } = await import('../factory'));
    ({ DefaultApiKeysService } = await import('../default-api-keys.service'));
  });

  it('returns configured service if registered', () => {
    const svc = {} as any;
    UserManagementConfiguration.configureServiceProviders({ apiKeyService: svc });
    expect(getApiKeyService()).toBe(svc);
    expect(getApiKeyService()).toBe(svc);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('apiKey', adapter);
    const service = getApiKeyService();
    expect(service).toBeInstanceOf(DefaultApiKeysService);
    expect(getApiKeyService()).toBe(service);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { UserManagementConfiguration } from '@/core/config';

let getApiCsrfService: typeof import('../factory').getApiCsrfService;
let DefaultCsrfService: typeof import('../default-csrf.service').DefaultCsrfService;

describe('getApiCsrfService', () => {
  beforeEach(async () => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
    UserManagementConfiguration.reset();
    ({ getApiCsrfService } = await import('../factory'));
    ({ DefaultCsrfService } = await import('../default-csrf.service'));
  });

  it('returns configured service if registered', () => {
    const service = {} as any;
    UserManagementConfiguration.configureServiceProviders({ csrfService: service });
    expect(getApiCsrfService()).toBe(service);
    expect(getApiCsrfService()).toBe(service);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('csrf', adapter);
    const service = getApiCsrfService();
    expect(service).toBeInstanceOf(DefaultCsrfService);
    expect(getApiCsrfService()).toBe(service);
  });
});

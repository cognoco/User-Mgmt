import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { UserManagementConfiguration } from '@/core/config';
import {
  configureServices,
  resetServiceContainer
} from '@/lib/config/service-container';

let getApiCsrfService: typeof import('../factory').getApiCsrfService;
let DefaultCsrfService: typeof import('../default-csrf.service').DefaultCsrfService;

describe('getApiCsrfService', () => {
  beforeEach(async () => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
    UserManagementConfiguration.reset();
    resetServiceContainer();
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

  it('uses ServiceContainer override when configured', () => {
    const svc = {} as any;
    configureServices({ csrfService: svc });
    const result = getApiCsrfService();
    expect(result).toBe(svc);
    expect(getApiCsrfService()).toBe(svc);
  });

  it('can reset cached instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('csrf', adapter);
    const first = getApiCsrfService();
    const second = getApiCsrfService();
    expect(first).toBe(second);

    const reset = getApiCsrfService({ reset: true });
    expect(reset).not.toBe(first);
  });
});

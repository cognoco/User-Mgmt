import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { UserManagementConfiguration } from '@/core/config';

let getApiConsentService: typeof import('@/services/consent/factory').getApiConsentService;
let DefaultConsentService: typeof import('@/services/consent/defaultConsent.service').DefaultConsentService;

describe('getApiConsentService', () => {
  beforeEach(async () => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
    UserManagementConfiguration.reset();
    ({ getApiConsentService } = await import('@/services/consent/factory'));
    ({ DefaultConsentService } = await import('@/services/consent/defaultConsent.service'));
  });

  it('returns configured service if registered', () => {
    const svc = {} as any;
    UserManagementConfiguration.configureServiceProviders({ consentService: svc });
    expect(getApiConsentService({ reset: true })).toBe(svc);
    expect(getApiConsentService()).toBe(svc);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('consent', adapter);
    const service = getApiConsentService({ reset: true });
    expect(service).toBeInstanceOf(DefaultConsentService);
    expect(getApiConsentService()).toBe(service);
  });

  it('allows resetting the cached instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('consent', adapter);
    const first = getApiConsentService({ reset: true });
    const second = getApiConsentService();
    const third = getApiConsentService({ reset: true });
    expect(first).toBe(second);
    expect(third).not.toBe(first);
  });
});

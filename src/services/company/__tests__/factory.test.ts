import { describe, it, expect, beforeEach, vi } from 'vitest';

let getApiCompanyService: typeof import('@/services/company/factory').getApiCompanyService;
let DefaultCompanyService: typeof import('@/services/company/companyService').DefaultCompanyService;
let UserManagementConfiguration: typeof import('@/core/config').UserManagementConfiguration;

describe('getApiCompanyService', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ UserManagementConfiguration } = await import('@/core/config'));
    UserManagementConfiguration.reset();
    ({ getApiCompanyService } = await import('@/services/company/factory'));
    ({ DefaultCompanyService } = await import('@/services/company/companyService'));
  });

  it('returns configured service if registered', () => {
    const svc = {} as any;
    UserManagementConfiguration.configureServiceProviders({ companyService: svc });
    expect(getApiCompanyService({ reset: true })).toBe(svc);
    expect(getApiCompanyService()).toBe(svc);
  });

  it('creates default service when not configured', () => {
    const service = getApiCompanyService({ reset: true });
    expect(service).toBeInstanceOf(DefaultCompanyService);
    expect(getApiCompanyService()).toBe(service);
  });

  it('allows resetting the cached instance', () => {
    const first = getApiCompanyService({ reset: true });
    const second = getApiCompanyService();
    const third = getApiCompanyService({ reset: true });
    expect(first).toBe(second);
    expect(third).not.toBe(first);
  });
});

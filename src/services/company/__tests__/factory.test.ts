import { describe, it, expect, beforeEach, vi } from 'vitest';

let getApiCompanyService: typeof import('../factory').getApiCompanyService;
let DefaultCompanyService: typeof import('../companyService').DefaultCompanyService;
let UserManagementConfiguration: typeof import('@/core/config').UserManagementConfiguration;

describe('getApiCompanyService', () => {
  beforeEach(async () => {
    vi.resetModules();
    ({ UserManagementConfiguration } = await import('@/core/config'));
    UserManagementConfiguration.reset();
    ({ getApiCompanyService } = await import('../factory'));
    ({ DefaultCompanyService } = await import('../companyService'));
  });

  it('returns configured service if registered', () => {
    const svc = {} as any;
    UserManagementConfiguration.configureServiceProviders({ companyService: svc });
    expect(getApiCompanyService()).toBe(svc);
    expect(getApiCompanyService()).toBe(svc);
  });

  it('creates default service when not configured', () => {
    const service = getApiCompanyService();
    expect(service).toBeInstanceOf(DefaultCompanyService);
    expect(getApiCompanyService()).toBe(service);
  });
});

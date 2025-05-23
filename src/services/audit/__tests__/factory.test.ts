import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { UserManagementConfiguration } from '@/core/config';

let getApiAuditService: typeof import('../factory').getApiAuditService;
let DefaultAuditService: typeof import('../default-audit.service').DefaultAuditService;

describe('getApiAuditService', () => {
  beforeEach(async () => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
    UserManagementConfiguration.reset();
    ({ getApiAuditService } = await import('../factory'));
    ({ DefaultAuditService } = await import('../default-audit.service'));
  });

  it('returns configured service if registered', () => {
    const svc = {} as any;
    UserManagementConfiguration.configureServiceProviders({ auditService: svc });
    expect(getApiAuditService()).toBe(svc);
    expect(getApiAuditService()).toBe(svc);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('audit', adapter);
    const service = getApiAuditService();
    expect(service).toBeInstanceOf(DefaultAuditService);
    expect(getApiAuditService()).toBe(service);
  });
});

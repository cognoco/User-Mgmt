import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { UserManagementConfiguration } from '@/core/config';
import { configureServices, resetServiceContainer } from '@/lib/config/service-container';

let getApiAuditService: typeof import('../factory').getApiAuditService;
let DefaultAuditService: typeof import('../default-audit.service').DefaultAuditService;

describe('getApiAuditService', () => {
  beforeEach(async () => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
    UserManagementConfiguration.reset();
    resetServiceContainer();
    ({ getApiAuditService } = await import('../factory'));
    ({ DefaultAuditService } = await import('../default-audit.service'));
  });

  it('returns configured service if registered', () => {
    const svc = {} as any;
    UserManagementConfiguration.configureServiceProviders({ auditService: svc });
    expect(getApiAuditService({ reset: true })).toBe(svc);
    expect(getApiAuditService()).toBe(svc);
  });

  it('creates default service with adapter when not configured', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('audit', adapter);
    const service = getApiAuditService({ reset: true });
    expect(service).toBeInstanceOf(DefaultAuditService);
    expect(getApiAuditService()).toBe(service);
  });

  it('uses ServiceContainer override when configured', () => {
    const svc = {} as any;
    configureServices({ auditService: svc });
    expect(getApiAuditService({ reset: true })).toBe(svc);
    expect(getApiAuditService()).toBe(svc);
  });

  it('allows resetting the cached instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('audit', adapter);
    const first = getApiAuditService({ reset: true });
    const second = getApiAuditService();
    const third = getApiAuditService({ reset: true });
    expect(first).toBe(second);
    expect(third).not.toBe(first);
  });
});

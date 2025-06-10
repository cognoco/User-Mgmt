import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { getApiOrganizationService } from '@/services/organization/factory';
import { DefaultOrganizationService } from '@/services/organization/defaultOrganization.service';

describe('getApiOrganizationService', () => {
  beforeEach(() => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
  });

  it('creates service with adapter and caches instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('organization', adapter);
    const svc1 = getApiOrganizationService({ reset: true });
    const svc2 = getApiOrganizationService();
    expect(svc1).toBeInstanceOf(DefaultOrganizationService);
    expect(svc1).toBe(svc2);
  });

  it('allows resetting the cached instance', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('organization', adapter);
    const first = getApiOrganizationService({ reset: true });
    const second = getApiOrganizationService();
    const third = getApiOrganizationService({ reset: true });
    expect(first).toBe(second);
    expect(third).not.toBe(first);
  });
});

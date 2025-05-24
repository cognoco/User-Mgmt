import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { getApiOrganizationService } from '../factory';
import { DefaultOrganizationService } from '../default-organization.service';

describe('getApiOrganizationService', () => {
  beforeEach(() => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
  });

  it('returns new service instance using adapter from registry', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('organization', adapter);
    const svc1 = getApiOrganizationService();
    const svc2 = getApiOrganizationService();
    expect(svc1).toBeInstanceOf(DefaultOrganizationService);
    expect(svc2).toBeInstanceOf(DefaultOrganizationService);
    expect(svc1).not.toBe(svc2);
  });
});

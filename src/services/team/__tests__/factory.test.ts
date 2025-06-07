import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { getApiTeamService } from '@/services/team/factory';
import { DefaultTeamService } from '@/services/team/defaultTeam.service';

vi.mock('@/lib/config/service-container', () => ({
  getServiceContainer: vi.fn(() => ({ team: undefined })),
  getServiceConfiguration: vi.fn(() => ({ featureFlags: { teams: true } }))
}));

describe('getApiTeamService', () => {
  beforeEach(() => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
    delete (globalThis as any).__UM_TEAM_SERVICE__;
  });

  it('caches instance using adapter from registry', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('team', adapter);
    const service1 = getApiTeamService({ reset: true });
    const service2 = getApiTeamService();
    expect(service1).toBeInstanceOf(DefaultTeamService);
    expect(service2).toBeInstanceOf(DefaultTeamService);
    expect(service1).toBe(service2);
  });
});

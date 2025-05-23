import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { getApiTeamService } from '../factory';
import { DefaultTeamService } from '../default-team.service';

describe('getApiTeamService', () => {
  beforeEach(() => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
  });

  it('returns new service instance using adapter from registry', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('team', adapter);
    const service1 = getApiTeamService();
    const service2 = getApiTeamService();
    expect(service1).toBeInstanceOf(DefaultTeamService);
    expect(service2).toBeInstanceOf(DefaultTeamService);
    expect(service1).not.toBe(service2);
  });
});

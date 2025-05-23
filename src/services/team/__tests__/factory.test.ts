import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { getApiTeamService } from '../factory';
import { DefaultTeamService } from '../default-team.service';

describe('getApiTeamService', () => {
  beforeEach(() => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
  });

  it('returns service using adapter from registry', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('team', adapter);
    const service = getApiTeamService();
    expect(service).toBeInstanceOf(DefaultTeamService);
    expect(getApiTeamService()).toBe(service);
  });
});

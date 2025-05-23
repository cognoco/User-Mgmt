import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { getApiUserService } from '../factory';
import { DefaultUserService } from '../default-user.service';

describe('getApiUserService', () => {
  beforeEach(() => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
  });

  it('returns service using adapter from registry', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('user', adapter);
    const service = getApiUserService();
    expect(service).toBeInstanceOf(DefaultUserService);
    expect(getApiUserService()).toBe(service);
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdapterRegistry } from '@/adapters/registry';
import { getApiAuthService } from '../factory';
import { DefaultAuthService } from '../default-auth.service';

describe('getApiAuthService', () => {
  beforeEach(() => {
    vi.resetModules();
    (AdapterRegistry as any).instance = null;
  });

  it('returns service using adapter from registry', () => {
    const adapter = {} as any;
    AdapterRegistry.getInstance().registerAdapter('auth', adapter);
    const service = getApiAuthService();
    expect(service).toBeInstanceOf(DefaultAuthService);
    expect(getApiAuthService()).toBe(service);
  });
});

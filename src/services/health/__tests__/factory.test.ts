import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createHealthService, getHealthService } from '@/src/services/health/factory'64;
import { DefaultHealthService } from '@/src/services/health/defaultHealth.service'133;
import { AdapterRegistry } from '@/adapters/registry';

vi.mock('../../adapters/registry', () => ({
  AdapterRegistry: {
    getInstance: vi.fn(() => ({
      getAdapter: vi.fn(() => ({})),
    })),
  },
}));

const MockAdapterRegistry = AdapterRegistry as unknown as { getInstance: vi.Mock };
const mockGetAdapter = vi.fn(() => ({}));
MockAdapterRegistry.getInstance = vi.fn(() => ({
  getAdapter: mockGetAdapter,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createHealthService', () => {
  it('creates service using health adapter', () => {
    const adapter = {} as any;
    mockGetAdapter.mockReturnValue(adapter);
    const svc = createHealthService();
    expect(svc).toBeInstanceOf(DefaultHealthService);
    expect(mockGetAdapter).toHaveBeenCalledWith('health');
  });
});

describe('getHealthService', () => {
  it('returns new service instance', () => {
    const svc = getHealthService();
    expect(svc).toBeInstanceOf(DefaultHealthService);
    expect(mockGetAdapter).toHaveBeenCalledWith('health');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStorageService, getStorageService } from '@/services/storage/factory';
import { DefaultFileStorageService } from '@/services/storage/DefaultFileStorageService';
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

describe('createStorageService', () => {
  it('creates service using storage adapter', () => {
    const adapter = {} as any;
    mockGetAdapter.mockReturnValue(adapter);
    const service = createStorageService();
    expect(service).toBeInstanceOf(DefaultFileStorageService);
    expect(mockGetAdapter).toHaveBeenCalledWith('storage');
  });
});

describe('getStorageService', () => {
  it('returns a new service instance', () => {
    const svc = getStorageService();
    expect(svc).toBeInstanceOf(DefaultFileStorageService);
    expect(mockGetAdapter).toHaveBeenCalledWith('storage');
  });
});

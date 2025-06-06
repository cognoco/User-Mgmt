import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStorageService, getStorageService } from '../factory';
import { DefaultFileStorageService } from '../DefaultFileStorageService';
import { getAdapter } from '../../adapters';

vi.mock('../../adapters', () => ({
  getAdapter: vi.fn(() => ({})),
}));

const MockGetAdapter = getAdapter as unknown as vi.Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createStorageService', () => {
  it('creates service using storage adapter', () => {
    const adapter = {} as any;
    MockGetAdapter.mockReturnValue(adapter);
    const service = createStorageService();
    expect(service).toBeInstanceOf(DefaultFileStorageService);
    expect(MockGetAdapter).toHaveBeenCalledWith('storage');
  });
});

describe('getStorageService', () => {
  it('returns a new service instance', () => {
    const svc = getStorageService();
    expect(svc).toBeInstanceOf(DefaultFileStorageService);
    expect(MockGetAdapter).toHaveBeenCalledWith('storage');
  });
});

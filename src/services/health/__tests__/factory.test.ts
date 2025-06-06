import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createHealthService, getHealthService } from '../factory';
import { DefaultHealthService } from '../default-health.service';
import { getAdapter } from '../../adapters';

vi.mock('../../adapters', () => ({
  getAdapter: vi.fn(() => ({})),
}));

const MockGetAdapter = getAdapter as unknown as vi.Mock;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createHealthService', () => {
  it('creates service using health adapter', () => {
    const adapter = {} as any;
    MockGetAdapter.mockReturnValue(adapter);
    const svc = createHealthService();
    expect(svc).toBeInstanceOf(DefaultHealthService);
    expect(MockGetAdapter).toHaveBeenCalledWith('health');
  });
});

describe('getHealthService', () => {
  it('returns new service instance', () => {
    const svc = getHealthService();
    expect(svc).toBeInstanceOf(DefaultHealthService);
    expect(MockGetAdapter).toHaveBeenCalledWith('health');
  });
});

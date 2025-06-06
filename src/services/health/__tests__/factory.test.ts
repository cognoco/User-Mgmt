import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getHealthService } from '../factory';
import { DefaultSystemHealthService } from '../system-health.service';
import { getServiceContainer } from '@/lib/config/service-container';

vi.mock('@/lib/config/service-container', () => ({
  getServiceContainer: vi.fn(() => ({}))
}));

describe('getHealthService', () => {
  beforeEach(() => {
    vi.resetModules();
    (getServiceContainer as unknown as vi.Mock).mockReturnValue({});
  });

  it('returns cached service instance', () => {
    const first = getHealthService({ reset: true });
    const second = getHealthService();
    expect(first).toBeInstanceOf(DefaultSystemHealthService);
    expect(second).toBe(first);
  });

  it('uses container provided instance if available', () => {
    const custom = {} as any;
    (getServiceContainer as unknown as vi.Mock).mockReturnValue({ health: custom });
    const service = getHealthService({ reset: true });
    expect(service).toBe(custom);
  });
});

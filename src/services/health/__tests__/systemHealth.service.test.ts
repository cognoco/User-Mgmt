import { describe, it, expect, vi } from 'vitest';
import { DefaultSystemHealthService } from '@/services/health/systemHealth.service';

describe('DefaultSystemHealthService', () => {
  it('returns ok when all services are healthy', async () => {
    const service = new DefaultSystemHealthService();
    const result = await service.checkSystemHealth();
    expect(result).toEqual({ status: 'ok' });
  });

  it('returns detailed status when any service is unhealthy', async () => {
    const service = new DefaultSystemHealthService();
    vi.spyOn(service, 'checkAllServices').mockResolvedValue({
      database: 'fail',
      redis: 'ok',
      email: 'ok',
      storage: 'ok'
    });
    const result = await service.checkSystemHealth();
    expect(result).toEqual({
      database: 'fail',
      redis: 'ok',
      email: 'ok',
      storage: 'ok'
    });
  });
});

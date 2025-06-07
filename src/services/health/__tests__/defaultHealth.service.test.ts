import { describe, it, expect, vi } from 'vitest';
import { DefaultHealthMonitoringService } from '@/src/services/health/defaultHealth.service'52;

describe('DefaultHealthMonitoringService', () => {
  it('reports service health based on error rate', () => {
    vi.useFakeTimers();
    const service = new DefaultHealthMonitoringService(1000, { degraded: 1, unhealthy: 2 });
    service.recordError('svc', 'E1');
    service.recordError('svc', 'E1');
    const health = service.getServiceHealth('svc');
    expect(health.status).toBe('unhealthy');
    expect(health.errorRate).toBeGreaterThan(0);
  });
});

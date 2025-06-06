import type { HealthMonitoringService } from '@/core/health/interfaces';
import { DefaultHealthMonitoringService } from './default-health.service';

export function createHealthService(): HealthMonitoringService {
  return new DefaultHealthMonitoringService();
}

export function getHealthService(): HealthMonitoringService {
  return createHealthService();
}

import type { HealthMonitoringService } from '@/core/health/interfaces';
import { DefaultHealthMonitoringService } from './default-health.service';

export interface HealthServiceConfig {
  windowMs?: number;
  thresholds?: { degraded: number; unhealthy: number };
}

export function createHealthMonitoringService(config: HealthServiceConfig = {}): HealthMonitoringService {
  const { windowMs, thresholds } = config;
  return new DefaultHealthMonitoringService(windowMs ?? 60_000, thresholds);
}

export { DefaultHealthMonitoringService } from './default-health.service';

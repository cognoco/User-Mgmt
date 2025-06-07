import { ErrorMetrics } from '@/lib/telemetry/errorMetrics';
import type { HealthMonitoringService, ServiceHealth, ServiceStatus } from '@/core/health/interfaces';

/**
 * Default in-memory implementation of {@link HealthMonitoringService}.
 *
 * This service aggregates errors per service and calculates basic
 * health information based on error rates.
 */
export class DefaultHealthMonitoringService implements HealthMonitoringService {
  private metrics = new ErrorMetrics();
  constructor(
    private windowMs = 60_000,
    private thresholds: { degraded: number; unhealthy: number } = {
      degraded: 1,
      unhealthy: 5,
    },
  ) {}

  recordError(serviceName: string, errorCode: string, critical = false): void {
    this.metrics.incrementErrorCount({
      serviceName,
      errorCode,
      environment: process.env.NODE_ENV || 'development',
      severity: critical ? 'critical' : 'non-critical',
    });
  }

  getServiceHealth(serviceName: string): ServiceHealth {
    const rate = this.metrics.getErrorRate({ serviceName }, this.windowMs);
    let status: ServiceStatus = 'healthy';
    if (rate >= this.thresholds.unhealthy) status = 'unhealthy';
    else if (rate >= this.thresholds.degraded) status = 'degraded';
    return { serviceName, errorRate: rate, status };
  }
}

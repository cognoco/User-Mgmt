/**
 * Interfaces for system health monitoring.
 */

export type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface ServiceHealth {
  serviceName: string;
  errorRate: number;
  status: ServiceStatus;
}

export interface HealthMonitoringService {
  /** Record an error for the given service */
  recordError(serviceName: string, errorCode: string, critical?: boolean): void;

  /** Retrieve current health information for the service */
  getServiceHealth(serviceName: string): ServiceHealth;
}

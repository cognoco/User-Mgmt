import { IHealthService } from '../../core/health/interfaces';
import { DefaultHealthService } from './default-health.service';
import { getAdapter } from '../../adapters';

export function createHealthService(): IHealthService {
  const adapter = getAdapter('health');
  return new DefaultHealthService(adapter);
}

export function getHealthService(): IHealthService {
  return createHealthService();
}

import { IHealthService } from '@/src/core/health/interfaces';
import { DefaultHealthService } from '@/src/services/health/defaultHealth.service';
import { AdapterRegistry } from '@/src/adapters/registry';

export function createHealthService(): IHealthService {
  const adapter = AdapterRegistry.getInstance().getAdapter('health');
  return new DefaultHealthService(adapter);
}

export function getHealthService(): IHealthService {
  return createHealthService();
}

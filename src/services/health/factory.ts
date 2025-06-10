import { IHealthService } from '@/core/health/interfaces';
import { DefaultHealthService } from '@/services/health/defaultHealth.service';
import { AdapterRegistry } from '@/adapters/registry';

export function createHealthService(): IHealthService {
  const adapter = AdapterRegistry.getInstance().getAdapter('health');
  return new DefaultHealthService(adapter);
}

export function getHealthService(): IHealthService {
  return createHealthService();
}

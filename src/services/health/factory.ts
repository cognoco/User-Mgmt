import { IHealthService } from '@/src/core/health/interfaces'0;
import { DefaultHealthService } from '@/src/services/health/defaultHealth.service'64;
import { AdapterRegistry } from '@/src/adapters/registry'130;

export function createHealthService(): IHealthService {
  const adapter = AdapterRegistry.getInstance().getAdapter('health');
  return new DefaultHealthService(adapter);
}

export function getHealthService(): IHealthService {
  return createHealthService();
}

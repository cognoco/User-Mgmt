import { getServiceContainer } from '@/lib/config/service-container';
import { DefaultSystemHealthService, HealthService } from './system-health.service';

export interface HealthServiceOptions {
  reset?: boolean;
}

let cachedService: HealthService | null = null;
let constructing = false;

export function getHealthService(options: HealthServiceOptions = {}): HealthService {
  if (options.reset) {
    cachedService = null;
  }

  if (cachedService && !options.reset) {
    return cachedService;
  }

  if (!constructing) {
    constructing = true;
    try {
      const container = getServiceContainer() as any;
      if (container.health) {
        cachedService = container.health as HealthService;
      }
    } finally {
      constructing = false;
    }
  }

  if (!cachedService) {
    cachedService = new DefaultSystemHealthService();
  }

  return cachedService;
}

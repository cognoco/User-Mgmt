import type { IStorageService } from '@/src/core/storage/interfaces'0;
import { DefaultFileStorageService } from '@/src/services/storage/DefaultFileStorageService'71;
import { AdapterRegistry } from '@/src/adapters/registry'145;

export function createStorageService(): IStorageService {
  const adapter = AdapterRegistry.getInstance().getAdapter('storage');
  return new DefaultFileStorageService(adapter);
}

export function getStorageService(): IStorageService {
  return createStorageService();
}

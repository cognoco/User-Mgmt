import type { IStorageService } from '@/src/core/storage/interfaces';
import { DefaultFileStorageService } from '@/src/services/storage/DefaultFileStorageService';
import { AdapterRegistry } from '@/src/adapters/registry';

export function createStorageService(): IStorageService {
  const adapter = AdapterRegistry.getInstance().getAdapter('storage');
  return new DefaultFileStorageService(adapter);
}

export function getStorageService(): IStorageService {
  return createStorageService();
}

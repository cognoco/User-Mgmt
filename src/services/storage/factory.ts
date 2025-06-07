import type { IStorageService } from '@/core/storage/interfaces';
import { DefaultFileStorageService } from '@/services/storage/DefaultFileStorageService';
import { AdapterRegistry } from '@/adapters/registry';

export function createStorageService(): IStorageService {
  const adapter = AdapterRegistry.getInstance().getAdapter('storage');
  return new DefaultFileStorageService(adapter);
}

export function getStorageService(): IStorageService {
  return createStorageService();
}

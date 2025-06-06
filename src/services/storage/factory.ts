import type { IStorageService } from '../../core/storage/interfaces';
import { DefaultFileStorageService } from './DefaultFileStorageService';
import { getAdapter } from '../../adapters';

export function createStorageService(): IStorageService {
  const adapter = getAdapter('storage');
  return new DefaultFileStorageService(adapter);
}

export function getStorageService(): IStorageService {
  return createStorageService();
}

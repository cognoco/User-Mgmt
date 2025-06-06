import type { FileStorageService } from '@/core/storage/services';
import { DefaultFileStorageService } from './DefaultFileStorageService';
import { SupabaseStorageAdapter } from '@/adapters/storage/supabase/SupabaseStorageAdapter';

export interface StorageServiceOptions {
  bucket?: string;
  reset?: boolean;
}

let cachedService: FileStorageService | null = null;

export function getStorageService(options: StorageServiceOptions = {}): FileStorageService {
  if (options.reset) {
    cachedService = null;
  }

  if (!cachedService) {
    const bucket = options.bucket || 'files';
    const adapter = new SupabaseStorageAdapter(bucket);
    cachedService = new DefaultFileStorageService(adapter);
  }

  return cachedService;
}

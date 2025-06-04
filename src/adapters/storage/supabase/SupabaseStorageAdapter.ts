import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  StorageAdapter,
  FileUploadOptions,
  FileUploadResult,
  FileDeleteResult,
} from '@/core/storage/interfaces';
import { getServiceSupabase } from '@/lib/database/supabase';

/**
 * Supabase implementation of the StorageAdapter interface.
 *
 * This adapter uses Supabase Storage buckets to store and retrieve files.
 */
export class SupabaseStorageAdapter implements StorageAdapter {
  constructor(
    private bucket: string,
    private supabase: SupabaseClient = getServiceSupabase(),
  ) {}

  async upload(
    data: Blob | File,
    path: string,
    options?: FileUploadOptions,
  ): Promise<FileUploadResult> {
    try {
      const { data: result, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(path, data, {
          contentType: options?.contentType,
          cacheControl: options?.cacheControl,
          upsert: options?.upsert,
        });

      if (error || !result) {
        return { success: false, error: error?.message || 'Upload failed' };
      }

      return {
        success: true,
        path: result.path,
        url: this.getPublicUrl(result.path) || undefined,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Upload failed' };
    }
  }

  async delete(path: string): Promise<FileDeleteResult> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucket)
        .remove([path]);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Delete failed' };
    }
  }

  getPublicUrl(path: string): string {
    try {
      const { data } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(path);
      return data.publicUrl ?? '';
    } catch {
      return '';
    }
  }
}

export default SupabaseStorageAdapter;

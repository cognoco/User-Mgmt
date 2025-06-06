import type {
  StorageAdapter,
  FileUploadOptions,
  FileUploadResult,
  FileDeleteResult,
} from '@/core/storage/interfaces';
import type { FileStorageService } from '@/core/storage/services';

/**
 * Default implementation of the FileStorageService.
 *
 * This service acts as an orchestrator around a {@link StorageAdapter}
 * instance. It forwards calls to the underlying adapter and can contain
 * additional business logic such as path generation or bucket selection.
 */
export class DefaultFileStorageService implements FileStorageService {
  constructor(private readonly storageAdapter: StorageAdapter) {}

  /**
   * Upload a file buffer to the configured storage provider.
   */
  async uploadFile(
    _bucketName: string,
    filePath: string,
    fileBuffer: ArrayBuffer,
    options?: FileUploadOptions,
  ): Promise<FileUploadResult> {
    try {
      const blob = new Blob([fileBuffer]);
      return await this.storageAdapter.upload(blob, filePath, options);
    } catch (err: any) {
      return { success: false, error: err.message || 'Upload failed' };
    }
  }

  /**
   * Delete a file from the configured storage provider.
   */
  async deleteFile(
    _bucketName: string,
    filePath: string,
  ): Promise<FileDeleteResult> {
    try {
      return await this.storageAdapter.delete(filePath);
    } catch (err: any) {
      return { success: false, error: err.message || 'Delete failed' };
    }
  }

  /**
   * Get a public URL for a stored file if available.
   */
  async getFileUrl(
    _bucketName: string,
    filePath: string,
  ): Promise<string | null> {
    try {
      const url = this.storageAdapter.getPublicUrl(filePath);
      return url || null;
    } catch {
      return null;
    }
  }

  /**
   * List files from the configured storage provider.
   */
  async listFiles(
    _bucketName: string,
    prefix = ''
  ): Promise<string[]> {
    try {
      return await this.storageAdapter.list(prefix);
    } catch {
      return [];
    }
  }
}

export default DefaultFileStorageService;

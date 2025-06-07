// FileStorageService Interface

import type {
  FileUploadOptions,
  FileUploadResult,
  FileDeleteResult,
} from '@/core/storage/interfaces';

/**
 * Business-level service for interacting with file storage.
 *
 * Implementations are expected to handle application-specific
 * logic such as path generation or bucket selection and will
 * delegate the actual storage operations to a {@link StorageAdapter}.
 */
export interface FileStorageService {
  /**
   * Upload a file buffer to the given bucket and path.
   *
   * @param bucketName - Target storage bucket
   * @param filePath - Destination path within the bucket
   * @param fileBuffer - File contents as an ArrayBuffer
   * @param options - Optional upload configuration
   * @returns Result object describing the upload outcome
   */
  uploadFile(
    bucketName: string,
    filePath: string,
    fileBuffer: ArrayBuffer,
    options?: FileUploadOptions,
  ): Promise<FileUploadResult>;

  /**
   * Delete a file from the given bucket.
   *
   * @param bucketName - Storage bucket containing the file
   * @param filePath - Path of the file to delete
   * @returns Result object describing the delete outcome
   */
  deleteFile(bucketName: string, filePath: string): Promise<FileDeleteResult>;

  /**
   * Retrieve a publicly accessible URL for a stored file if available.
   *
   * @param bucketName - Storage bucket where the file resides
   * @param filePath - Path of the file in the bucket
   * @returns Public URL string or `null` when not available
   */
  getFileUrl(bucketName: string, filePath: string): Promise<string | null>;

  /**
   * List files within a bucket under an optional prefix.
   */
  listFiles(bucketName: string, prefix?: string): Promise<string[]>;
}

/**
 * Storage Adapter Interfaces
 *
 * Defines the contract that any storage provider implementation must fulfill.
 * This abstraction allows the application to remain agnostic of the underlying
 * storage mechanism and enables a pluggable architecture.
 */

export interface FileUploadOptions {
  /** MIME type of the file being uploaded */
  contentType?: string;
  /** Cache-Control header value */
  cacheControl?: string;
  /** If true the existing file will be overwritten */
  upsert?: boolean;
}

export interface FileUploadResult {
  success: boolean;
  /** Full path where the file was stored */
  path?: string;
  /** Optional publicly accessible URL */
  url?: string;
  error?: string;
}

export interface FileDeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Generic storage adapter interface.
 *
 * Implementations should handle the actual communication with the storage
 * provider. Methods should reject their promises only for unexpected
 * failures. Business errors are reported via the result objects.
 */
export interface StorageAdapter {
  /**
   * Upload a file or blob to the given storage path.
   *
   * @param data File or Blob content to store
   * @param path Destination path within the storage
   * @param options Optional upload configuration
   * @returns Result object with success status, stored path and public URL
   */
  upload(
    data: Blob | File,
    path: string,
    options?: FileUploadOptions,
  ): Promise<FileUploadResult>;

  /**
   * Delete a file from storage.
   *
   * @param path File path within the storage
   * @returns Result object with success status or error
   */
  delete(path: string): Promise<FileDeleteResult>;

  /**
   * Retrieve a public URL for a stored file.
   *
   * Implementations may return a signed URL or a direct public link depending
   * on the capabilities of the underlying provider.
   *
   * @param path File path within the storage
   * @returns Publicly accessible URL
   */
  getPublicUrl(path: string): string;
}

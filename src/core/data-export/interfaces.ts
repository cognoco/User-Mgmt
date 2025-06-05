export interface DataExportService {
  createUserDataExport(
    userId: string,
    options?: Partial<import('@/lib/exports/types').ExportOptions>
  ): Promise<import('@/lib/exports/types').UserDataExport | null>;

  processUserDataExport(exportId: string, userId: string): Promise<void>;

  getUserExportData(userId: string): Promise<import('@/lib/exports/types').UserExportData>;

  checkUserExportStatus(exportId: string): Promise<import('@/lib/exports/types').DataExportResponse>;

  getUserDataExportById(exportId: string): Promise<import('@/lib/exports/types').UserDataExport | null>;

  getUserDataExportByToken(token: string): Promise<import('@/lib/exports/types').UserDataExport | null>;

  getUserExportDownloadUrl(filePath: string): string;

  /**
   * Check if the user has recently requested an export
   * to enforce rate limiting.
   */
  isUserRateLimited(userId: string): Promise<boolean>;
}

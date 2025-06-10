import { DataExportService } from '@/core/dataExport/interfaces';
import {
  createUserDataExport,
  processUserDataExport,
  getUserExportData,
  checkUserExportStatus,
  getUserDataExportById,
  getUserDataExportByToken,
  getUserExportDownloadUrl,
  isUserRateLimited,
} from '@/lib/exports/export.service';
import type {
  ExportOptions,
  UserDataExport,
  UserExportData,
  DataExportResponse,
} from '@/lib/exports/types';

export class DefaultDataExportService implements DataExportService {
  createUserDataExport(
    userId: string,
    options?: Partial<ExportOptions>
  ): Promise<UserDataExport | null> {
    return createUserDataExport(userId, options);
  }

  processUserDataExport(exportId: string, userId: string): Promise<void> {
    return processUserDataExport(exportId, userId);
  }

  getUserExportData(userId: string): Promise<UserExportData> {
    return getUserExportData(userId);
  }

  checkUserExportStatus(exportId: string): Promise<DataExportResponse> {
    return checkUserExportStatus(exportId);
  }

  getUserDataExportById(exportId: string): Promise<UserDataExport | null> {
    return getUserDataExportById(exportId);
  }

  getUserDataExportByToken(token: string): Promise<UserDataExport | null> {
    return getUserDataExportByToken(token);
  }

  getUserExportDownloadUrl(filePath: string): string {
    return getUserExportDownloadUrl(filePath);
  }

  isUserRateLimited(userId: string): Promise<boolean> {
    return isUserRateLimited(userId);
  }
}

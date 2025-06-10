import type { IDataExportDataProvider } from '@/core/dataExport/IDataExportDataProvider';
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
import {
  createCompanyDataExport,
  processCompanyDataExport,
  getCompanyExportData,
  checkCompanyExportStatus,
  getCompanyDataExportById,
  getCompanyDataExportByToken,
  getCompanyExportDownloadUrl,
  isCompanyRateLimited,
} from '@/lib/exports/companyExport.service';
import type {
  ExportOptions,
  UserDataExport,
  CompanyDataExport,
  UserExportData,
  CompanyExportData,
  DataExportResponse,
} from '@/lib/exports/types';

/**
 * Supabase implementation of {@link IDataExportDataProvider}.
 *
 * This provider delegates to utility functions that interact with Supabase
 * tables and storage.
 */
export class SupabaseDataExportProvider implements IDataExportDataProvider {
  // No configuration needed for now since lib functions use a global client
  constructor(
    private supabaseUrl?: string,
    private supabaseKey?: string,
  ) {}

  async createUserDataExport(
    userId: string,
    options: Partial<ExportOptions> = {},
  ): Promise<UserDataExport | null> {
    return createUserDataExport(userId, options);
  }

  async processUserDataExport(exportId: string, userId: string): Promise<void> {
    await processUserDataExport(exportId, userId);
  }

  async getUserExportData(userId: string): Promise<UserExportData> {
    return getUserExportData(userId);
  }

  async checkUserExportStatus(exportId: string): Promise<DataExportResponse> {
    return checkUserExportStatus(exportId);
  }

  async getUserDataExportById(exportId: string): Promise<UserDataExport | null> {
    return getUserDataExportById(exportId);
  }

  async getUserDataExportByToken(token: string): Promise<UserDataExport | null> {
    return getUserDataExportByToken(token);
  }

  getUserExportDownloadUrl(filePath: string): string {
    return getUserExportDownloadUrl(filePath);
  }

  async isUserRateLimited(userId: string): Promise<boolean> {
    return isUserRateLimited(userId);
  }

  async createCompanyDataExport(
    companyId: string,
    userId: string,
    options: Partial<ExportOptions> = {},
  ): Promise<CompanyDataExport | null> {
    return createCompanyDataExport(companyId, userId, options);
  }

  async processCompanyDataExport(
    exportId: string,
    companyId: string,
    userId: string,
  ): Promise<void> {
    await processCompanyDataExport(exportId, companyId, userId);
  }

  async getCompanyExportData(companyId: string): Promise<CompanyExportData> {
    return getCompanyExportData(companyId);
  }

  async checkCompanyExportStatus(exportId: string): Promise<DataExportResponse> {
    return checkCompanyExportStatus(exportId);
  }

  async getCompanyDataExportById(
    exportId: string,
  ): Promise<CompanyDataExport | null> {
    return getCompanyDataExportById(exportId);
  }

  async getCompanyDataExportByToken(
    token: string,
  ): Promise<CompanyDataExport | null> {
    return getCompanyDataExportByToken(token);
  }

  getCompanyExportDownloadUrl(filePath: string): string {
    return getCompanyExportDownloadUrl(filePath);
  }

  async isCompanyRateLimited(companyId: string): Promise<boolean> {
    return isCompanyRateLimited(companyId);
  }
}

export default SupabaseDataExportProvider;

/**
 * Data Export Data Provider Interface
 *
 * Defines persistence operations for user and company data exports.
 * Implementations handle database access only and contain no business logic.
 */
import type {
  ExportOptions,
  UserDataExport,
  CompanyDataExport,
  UserExportData,
  CompanyExportData,
  DataExportResponse
} from '@/lib/exports/types';

export interface IDataExportDataProvider {
  /** Create a new user export request */
  createUserDataExport(
    userId: string,
    options?: Partial<ExportOptions>
  ): Promise<UserDataExport | null>;

  /** Process a user export immediately */
  processUserDataExport(exportId: string, userId: string): Promise<void>;

  /** Retrieve all user data for export */
  getUserExportData(userId: string): Promise<UserExportData>;

  /** Check status of a user export */
  checkUserExportStatus(exportId: string): Promise<DataExportResponse>;

  /** Get a user export record by id */
  getUserDataExportById(exportId: string): Promise<UserDataExport | null>;

  /** Get a user export record by download token */
  getUserDataExportByToken(token: string): Promise<UserDataExport | null>;

  /** Get a public download URL for a user export file */
  getUserExportDownloadUrl(filePath: string): string;

  /** Determine if the user has recently requested an export */
  isUserRateLimited(userId: string): Promise<boolean>;

  /** Create a new company export request */
  createCompanyDataExport(
    companyId: string,
    userId: string,
    options?: Partial<ExportOptions>
  ): Promise<CompanyDataExport | null>;

  /** Process a company export */
  processCompanyDataExport(
    exportId: string,
    companyId: string,
    userId: string
  ): Promise<void>;

  /** Retrieve all company data for export */
  getCompanyExportData(companyId: string): Promise<CompanyExportData>;

  /** Check status of a company export */
  checkCompanyExportStatus(exportId: string): Promise<DataExportResponse>;

  /** Get a company export by id */
  getCompanyDataExportById(exportId: string): Promise<CompanyDataExport | null>;

  /** Get a company export by token */
  getCompanyDataExportByToken(token: string): Promise<CompanyDataExport | null>;

  /** Get a public download URL for a company export file */
  getCompanyExportDownloadUrl(filePath: string): string;

  /** Determine if the company has recently requested an export */
  isCompanyRateLimited(companyId: string): Promise<boolean>;
}

/** Convenience alias */
export type DataExportDataProvider = IDataExportDataProvider;

/**
 * Types for the data export functionality
 */

export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv'
}

export enum ExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed', 
  FAILED = 'failed'
}

export enum DataExportStorageBucket {
  USER_EXPORTS = 'user-exports',
  COMPANY_EXPORTS = 'company-exports'
}

export interface ExportOptions {
  format: ExportFormat;
  isLargeDataset?: boolean;
  expiryHours?: number;
}

export interface UserDataExport {
  id: string;
  userId: string;
  format: ExportFormat;
  status: ExportStatus;
  filePath?: string | null;
  downloadToken: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  expiresAt: string;
  errorMessage?: string | null;
  fileSizeBytes?: number | null;
  isLargeDataset: boolean;
  notificationSent: boolean;
}

export interface CompanyDataExport {
  id: string;
  companyId: string;
  userId: string;
  format: ExportFormat;
  status: ExportStatus;
  filePath?: string | null;
  downloadToken: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  expiresAt: string;
  errorMessage?: string | null;
  fileSizeBytes?: number | null;
  isLargeDataset: boolean;
  notificationSent: boolean;
}

export interface DataExportResponse {
  id: string;
  status: ExportStatus;
  isLargeDataset: boolean;
  message: string;
  downloadUrl?: string;
  format: ExportFormat;
}

export interface UserExportData {
  profile: any;
  preferences: any;
  activityLogs: any[];
  [key: string]: any;
}

export interface CompanyExportData {
  companyProfile: any;
  companyMembers: any[];
  companyRoles: any[];
  activityLogs: any[];
  [key: string]: any;
} 
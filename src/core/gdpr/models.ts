/**
 * GDPR Domain Models
 *
 * This file defines the core entity models for GDPR operations such as
 * personal data export and account deletion.
 */

/** Information returned for a user data export */
export interface UserDataExport {
  /** ID of the user the export belongs to */
  userId: string;
  /** File name suggested for download */
  filename: string;
  /** Exported data object */
  data: Record<string, any>;
}

/** Result of an account deletion request */
export interface AccountDeletionResult {
  /** Whether the deletion request succeeded */
  success: boolean;
  /** Optional success message */
  message?: string;
  /** Optional error message */
  error?: string;
}

/** Parameters for querying user data exports */
export interface DataExportQuery {
  /** Filter exports by user */
  userId?: string;
  /** Pagination: page number (1-based) */
  page?: number;
  /** Pagination: items per page */
  limit?: number;
  /** Sort field */
  sortBy?: "createdAt" | "userId";
  /** Sort direction */
  sortOrder?: "asc" | "desc";
}

/** Deletion request record */
export interface DeletionRequest {
  /** Unique identifier of the request */
  id: string;
  /** ID of the user the request belongs to */
  userId: string;
  /** Current request status */
  status: "pending" | "completed" | "failed";
  /** Timestamp when the request was created */
  requestedAt: string;
  /** When the request was completed */
  completedAt?: string;
  /** When the account will be permanently deleted */
  scheduledDeletionAt?: string;
  /** Optional message or error */
  message?: string;
}

/** Parameters for querying deletion requests */
export interface DeletionRequestQuery {
  /** Filter by user */
  userId?: string;
  /** Filter by request status */
  status?: "pending" | "completed" | "failed";
  /** Pagination: page number (1-based) */
  page?: number;
  /** Pagination: items per page */
  limit?: number;
  /** Sort field */
  sortBy?: "requestedAt" | "status";
  /** Sort direction */
  sortOrder?: "asc" | "desc";
}

/** Type guard for DeletionRequest */
export function isDeletionRequest(value: unknown): value is DeletionRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as any).id === "string"
  );
}

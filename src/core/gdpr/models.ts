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

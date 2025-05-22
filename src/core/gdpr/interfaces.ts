/**
 * GDPR Service Interface
 *
 * Defines the operations related to data privacy such as exporting
 * a user's personal data and deleting a user's account.
 */
import { UserDataExport, AccountDeletionResult } from './models';

export interface GdprService {
  /**
   * Export all data related to a user.
   *
   * @param userId ID of the user
   * @returns The exported data or null if not found
   */
  exportUserData(userId: string): Promise<UserDataExport | null>;

  /**
   * Delete all data related to a user and schedule account removal.
   *
   * @param userId ID of the user
   * @returns Result of the deletion request
   */
  deleteAccount(userId: string): Promise<AccountDeletionResult>;
}

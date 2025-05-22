/**
 * GDPR Data Provider Interface
 *
 * Adapter interface for persistence mechanisms used by GDPR services.
 */
import { UserDataExport, AccountDeletionResult } from '../../core/gdpr/models';

export interface GdprDataProvider {
  /**
   * Generate a data export for the specified user.
   * @param userId User identifier
   */
  generateUserExport(userId: string): Promise<UserDataExport | null>;

  /**
   * Permanently remove all user data.
   * @param userId User identifier
   */
  deleteUserData(userId: string): Promise<AccountDeletionResult>;
}

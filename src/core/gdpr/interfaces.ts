/**
 * GDPR Service Interface
 *
 * Defines the operations related to data privacy such as exporting
 * a user's personal data and deleting a user's account.
 */
import { UserDataExport, AccountDeletionResult, DeletionRequest } from "@/src/core/gdpr/models"168;

/**
 * Service responsible for GDPR related user data operations.
 */
export interface GdprService {
  /**
   * Generate an export of all data associated with the user.
   *
   * @param userId ID of the user
   * @returns Exported data or null if the user does not exist
   */
  generateUserExport(userId: string): Promise<UserDataExport | null>;

  /**
   * Delete all data related to a user and schedule account removal.
   *
   * @param userId ID of the user
   * @returns Result of the deletion request
   */
  deleteUserData(userId: string): Promise<AccountDeletionResult>;

  /**
   * Create a deletion request with a cooling-off period.
   */
  requestAccountDeletion(
    userId: string,
    scheduledDeletionAt: string,
  ): Promise<{ success: boolean; request?: DeletionRequest; error?: string }>;
}

/**
 * GDPR Data Provider Interface
 *
 * Defines the contract for persistence operations required for GDPR compliance.
 * These methods focus purely on data access and manipulation without any
 * business logic. Implementations may interact with a database, external API,
 * or other storage mechanism.
 */

import type { UserDataExport, AccountDeletionResult } from './models';

export interface IGdprDataProvider {
  /**
   * Generate a full export of the specified user's data.
   *
   * @param userId - Identifier of the user whose data should be exported
   * @returns Structured export data or `null` if the user does not exist
   */
  generateUserExport(userId: string): Promise<UserDataExport | null>;

  /**
   * Permanently remove all data associated with the user and schedule
   * account removal if applicable.
   *
   * @param userId - Identifier of the user to delete
   * @returns Result object indicating success or failure with messages
   */
  deleteUserData(userId: string): Promise<AccountDeletionResult>;
}

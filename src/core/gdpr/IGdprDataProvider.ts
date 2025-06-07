/**
 * GDPR Data Provider Interface
 *
 * Defines the contract for persistence operations required for GDPR compliance.
 * These methods focus purely on data access and manipulation without any
 * business logic. Implementations may interact with a database, external API,
 * or other storage mechanism.
 */

import type { PaginationMeta } from "@/lib/api/common/responseFormatter";
import type {
  UserDataExport,
  AccountDeletionResult,
  DataExportQuery,
  DeletionRequest,
  DeletionRequestQuery,
} from "@/core/gdpr/models";

export interface IGdprDataProvider {
  /**
   * Initiate generation of a user data export.
   *
   * @param userId - Identifier of the user
   * @returns Operation result with created export metadata or error
   */
  requestUserExport(
    userId: string,
  ): Promise<{ success: boolean; export?: UserDataExport; error?: string }>;

  /**
   * Generate a full export of the specified user's data.
   *
   * @param userId - Identifier of the user whose data should be exported
   * @returns Structured export data or `null` if the user does not exist
   */
  generateUserExport(userId: string): Promise<UserDataExport | null>;

  /**
   * Retrieve a previously generated export by identifier.
   *
   * @param exportId - Identifier of the export
   * @returns Export data or null if not found
   */
  getUserExport(exportId: string): Promise<UserDataExport | null>;

  /**
   * Query user exports with pagination support.
   *
   * @param query - Filtering and pagination options
   * @returns Array of exports with pagination metadata
   */
  listUserExports(
    query: DataExportQuery,
  ): Promise<{ exports: UserDataExport[]; pagination: PaginationMeta }>;

  /**
   * Permanently remove all data associated with the user and schedule
   * account removal if applicable.
   *
   * @param userId - Identifier of the user to delete
   * @returns Result object indicating success or failure with messages
   */
  deleteUserData(userId: string): Promise<AccountDeletionResult>;

  /**
   * Create an account deletion request for the user.
   *
   * @param userId - Identifier of the user
   * @returns Created deletion request or error information
   */
  requestAccountDeletion(
    userId: string,
    scheduledDeletionAt: string,
  ): Promise<{ success: boolean; request?: DeletionRequest; error?: string }>;

  /**
   * Retrieve a deletion request by user id.
   *
   * @param userId - Identifier of the user
   */
  getDeletionRequest(userId: string): Promise<DeletionRequest | null>;

  /**
   * List deletion requests with pagination and sorting.
   *
   * @param query - Filtering and pagination options
   */
  listDeletionRequests(
    query: DeletionRequestQuery,
  ): Promise<{ requests: DeletionRequest[]; pagination: PaginationMeta }>;

  /**
   * Cancel a pending deletion request.
   *
   * @param requestId - Identifier of the request to cancel
   */
  cancelDeletionRequest(
    requestId: string,
  ): Promise<{ success: boolean; error?: string }>;
}

/**
 * Admin Data Provider Interface
 *
 * Defines the contract for persistence operations related to
 * administrative functions such as user management and audit logs.
 * Implementations should provide purely data access logic without
 * any business rules.
 */
import type { UserProfile } from '../user/models';
import type { AuditLogEntry, AuditLogQuery } from '../audit/models';
import type { PaginationMeta } from '@/lib/api/common/response-formatter';
import type { ListUsersParams } from './interfaces';

export interface IAdminDataProvider {
  /**
   * Retrieve a paginated list of users.
   *
   * @param params Query parameters for pagination and filtering
   * @returns Array of users with pagination metadata
   */
  listUsers(
    params: ListUsersParams
  ): Promise<{ users: UserProfile[]; pagination: PaginationMeta }>;

  /**
   * Fetch a single user by ID.
   *
   * @param id Unique identifier of the user
   * @returns The user profile or null if not found
   */
  getUserById(id: string): Promise<UserProfile | null>;

  /**
   * Update a user's information.
   *
   * @param id Unique identifier of the user
   * @param data Partial user profile data to update
   * @returns The updated user profile
   */
  updateUser(id: string, data: Partial<UserProfile>): Promise<UserProfile>;

  /**
   * Delete a user by ID.
   *
   * @param id Unique identifier of the user
   */
  deleteUser(id: string): Promise<void>;

  /**
   * Retrieve audit logs based on query parameters.
   *
   * @param query Filtering and pagination options
   * @returns Array of audit logs with pagination metadata
   */
  getAuditLogs(
    query: AuditLogQuery
  ): Promise<{ logs: AuditLogEntry[]; pagination: PaginationMeta }>;
}


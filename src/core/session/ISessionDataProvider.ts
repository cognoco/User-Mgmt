/**
 * Session Data Provider Interface
 *
 * Defines the contract for persistence operations related to user sessions.
 * Implementations provide database access for session management so that
 * services remain database agnostic.
 */

import type {
  SessionInfo,
  SessionCreatePayload,
  SessionUpdatePayload,
  SessionQueryParams,
  SessionListResult,
  SessionOperationResult,
  SessionDeletionResult,
  SessionBatchResult,
} from './models';

/**
 * Interface for session persistence operations.
 * These methods should contain no business logic and strictly handle
 * data access concerns.
 */
export interface ISessionDataProvider {
  /**
   * Create a new session for the given user.
   *
   * @param userId - Owner of the session
   * @param payload - Session details to persist
   */
  createSession(
    userId: string,
    payload: SessionCreatePayload
  ): Promise<SessionOperationResult>;

  /**
   * Retrieve a specific session by its identifier.
   */
  getSession(userId: string, sessionId: string): Promise<SessionInfo | null>;

  /**
   * Update an existing session.
   */
  updateSession(
    userId: string,
    sessionId: string,
    update: SessionUpdatePayload
  ): Promise<SessionOperationResult>;

  /**
   * Retrieve all sessions that belong to the specified user.
   */
  listUserSessions(userId: string): Promise<SessionInfo[]>;

  /**
   * Retrieve sessions for a user with pagination and filtering.
   *
   * @example
   * ```ts
   * const result = await provider.queryUserSessions(userId, {
   *   page: 1,
   *   limit: 20,
   *   sortBy: 'createdAt',
   *   sortDirection: 'desc',
   * });
   * ```
   */
  queryUserSessions(
    userId: string,
    query?: SessionQueryParams
  ): Promise<SessionListResult>;

  /**
   * Remove a specific user session.
   */
  deleteUserSession(
    userId: string,
    sessionId: string
  ): Promise<SessionDeletionResult>;

  /**
   * Remove multiple sessions in one operation.
   */
  deleteUserSessions(
    userId: string,
    sessionIds: string[]
  ): Promise<SessionBatchResult>;

  /**
   * Remove all sessions for a user.
   */
  deleteAllUserSessions(userId: string): Promise<SessionDeletionResult>;
}

/** Convenience alias. */
export type SessionDataProvider = ISessionDataProvider;


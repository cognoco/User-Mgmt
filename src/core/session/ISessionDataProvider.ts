/**
 * Session Data Provider Interface
 *
 * Defines the contract for persistence operations related to user sessions.
 * Implementations provide database access for session management so that
 * services remain database agnostic.
 */

import type { SessionInfo } from './models';

/**
 * Interface for session persistence operations.
 * These methods should contain no business logic and strictly handle
 * data access concerns.
 */
export interface ISessionDataProvider {
  /**
   * Retrieve all sessions that belong to the specified user.
   *
   * @param userId The user identifier
   * @returns List of session information objects
   */
  listUserSessions(userId: string): Promise<SessionInfo[]>;

  /**
   * Remove a specific user session.
   *
   * @param userId The user that owns the session
   * @param sessionId The session identifier to remove
   * @returns Result object indicating success or error
   */
  deleteUserSession(
    userId: string,
    sessionId: string
  ): Promise<{ success: boolean; error?: string }>;
}


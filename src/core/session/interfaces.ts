/**
 * Session Service Interfaces
 *
 * Defines the contracts for session management services.
 */

import { SessionInfo } from '@/src/core/session/models'106;

/**
 * Core session service interface
 */
export interface SessionService {
  /**
   * List all sessions for the specified user
   *
   * The promise resolves with an empty array when the user has no sessions.
   * It should reject if the underlying provider fails to fetch the sessions.
   */
  listUserSessions(userId: string): Promise<SessionInfo[]>;

  /**
   * Revoke a specific session for the user.
   *
   * @param userId - The owner of the session.
   * @param sessionId - The identifier of the session to revoke.
   * @returns Promise resolving with a success flag or an error description.
   *          Expected business errors are returned in the resolved object while
   *          unexpected failures should reject the promise.
   */
  revokeUserSession(
    userId: string,
    sessionId: string
  ): Promise<{ success: boolean; error?: string }>;
}

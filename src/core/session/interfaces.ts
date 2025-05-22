/**
 * Session Service Interfaces
 *
 * Defines the contracts for session management services.
 */

import { SessionInfo } from './models';

/**
 * Core session service interface
 */
export interface SessionService {
  /**
   * List all sessions for the specified user
   */
  listUserSessions(userId: string): Promise<SessionInfo[]>;

  /**
   * Revoke a specific session for the user
   */
  revokeUserSession(userId: string, sessionId: string): Promise<void>;
}

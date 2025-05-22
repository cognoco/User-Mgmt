/**
 * Session Data Provider Interface
 *
 * Defines database operations required for session management.
 */

import { SessionInfo } from '../../core/session/models';

export interface SessionDataProvider {
  /** List all sessions for a user */
  listUserSessions(userId: string): Promise<SessionInfo[]>;
  /** Delete a specific user session */
  deleteUserSession(userId: string, sessionId: string): Promise<void>;
}

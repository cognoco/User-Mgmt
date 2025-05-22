/**
 * Session Management Models
 *
 * Defines the core entities used for session management.
 */

/**
 * Basic information about a user session
 */
export interface SessionInfo {
  /** Unique session identifier */
  id: string;
  /** Timestamp when the session was created */
  createdAt: string;
  /** Timestamp of the last recorded activity */
  lastActiveAt?: string;
  /** IP address associated with the session */
  ipAddress?: string;
  /** User agent string for the session */
  userAgent?: string;
  /** True if this is the currently authenticated session */
  isCurrent?: boolean;
}

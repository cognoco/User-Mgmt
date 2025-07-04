/**
 * Session Management Models
 *
 * Defines the core entities used for session management.
 */

import type { PaginationMeta } from '@/lib/api/common/responseFormatter';
import type { DataProviderError } from '@/core/common/errors';

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

/**
 * Payload for creating a new session.
 * The identifier and creation timestamp are generated by the data source.
 */
export type SessionCreatePayload = Omit<SessionInfo, 'id' | 'createdAt'>;

/**
 * Payload for updating an existing session.
 */
export type SessionUpdatePayload = Partial<Omit<SessionInfo, 'id' | 'createdAt'>>;

/**
 * Query parameters for filtering and paginating session lists.
 */
export interface SessionQueryParams {
  ipAddress?: string;
  sortBy?: 'createdAt' | 'lastActiveAt';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Result returned when listing sessions with pagination.
 */
export interface SessionListResult {
  sessions: SessionInfo[];
  pagination: PaginationMeta;
}

/**
 * Result of a session operation such as create or update.
 */
export interface SessionOperationResult {
  success: boolean;
  session?: SessionInfo;
  /** Optional short error message */
  error?: string;
  /** Detailed provider error information */
  details?: DataProviderError;
}

/**
 * Result of a deletion operation.
 */
export interface SessionDeletionResult {
  success: boolean;
  count?: number;
  /** Optional short error message */
  error?: string;
  /** Detailed provider error */
  details?: DataProviderError;
}

/**
 * Result of batch session deletion.
 */
export interface SessionBatchResult {
  success: boolean;
  results: {
    sessionId: string;
    success: boolean;
    error?: string;
    details?: DataProviderError;
  }[];
}

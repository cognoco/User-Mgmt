/**
 * API Key Domain Models
 */

import { z } from 'zod';

/** API key entity */
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  prefix: string;
  scopes: string[];
  expiresAt?: string | null;
  lastUsedAt?: string | null;
  createdAt: string;
  isRevoked: boolean;
}

/** Payload for creating an API key */
export const apiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()),
  expiresAt: z.string().datetime().optional()
});
export type ApiKeyCreatePayload = z.infer<typeof apiKeyCreateSchema>;

/** Result of API key creation */
export interface ApiKeyCreateResult {
  success: boolean;
  key?: ApiKey;
  plaintext?: string;
  error?: string;
}

/**
 * Parameters for querying API keys.
 */
export interface ApiKeyQuery {
  /** Search by key name */
  search?: string;

  /** Filter by revoked state */
  isRevoked?: boolean;

  /** Filter by expiration date (ISO string) */
  expiresBefore?: string;

  /** Sort field */
  sortBy?: 'name' | 'createdAt' | 'expiresAt';

  /** Sort direction */
  sortDirection?: 'asc' | 'desc';

  /** Page number starting from 1 */
  page?: number;

  /** Items per page */
  limit?: number;
}

/**
 * Result of an API key list query.
 */
export interface ApiKeyListResult {
  /** Array of API keys for the current page */
  apiKeys: ApiKey[];

  /** Total number of keys matching the query */
  total: number;

  /** Current page number */
  page: number;

  /** Items per page */
  limit: number;

  /** Total number of pages */
  totalPages: number;
}

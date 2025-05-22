/**
 * API Key Service Interface
 *
 * Defines the contract for API key management operations.
 */

import { ApiKey, ApiKeyCreatePayload, ApiKeyCreateResult } from './models';

export interface ApiKeyService {
  /**
   * Get all API keys for a user.
   */
  listKeys(userId: string): Promise<ApiKey[]>;

  /**
   * Create a new API key for a user.
   */
  createKey(userId: string, data: ApiKeyCreatePayload): Promise<ApiKeyCreateResult>;

  /**
   * Revoke an existing API key.
   */
  revokeKey(userId: string, keyId: string): Promise<{ success: boolean; error?: string }>;
}

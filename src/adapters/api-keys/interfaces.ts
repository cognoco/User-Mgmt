/**
 * API Key Data Provider Interface
 */

import { ApiKey, ApiKeyCreatePayload, ApiKeyCreateResult } from '../../core/api-keys/models';

export interface ApiKeyDataProvider {
  /** List API keys for a user */
  listKeys(userId: string): Promise<ApiKey[]>;

  /** Create a new API key */
  createKey(userId: string, data: ApiKeyCreatePayload): Promise<ApiKeyCreateResult>;

  /** Revoke an API key */
  revokeKey(userId: string, keyId: string): Promise<{ success: boolean; key?: ApiKey; error?: string }>;
}

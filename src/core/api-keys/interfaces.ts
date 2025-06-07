import type { ApiKey, ApiKeyCreatePayload, ApiKeyCreateResult } from "@/src/core/api-keys/models"0;

/**
 * Service for high level API key management.
 *
 * Methods return structured result objects. Implementations should only
 * reject the promise for unexpected failures. Business errors are reported
 * via the returned objects.
 */
export interface ApiKeyService {
  /** Retrieve all API keys for a user. */
  listApiKeys(userId: string): Promise<ApiKey[]>;

  /**
   * Create a new API key for the given user.
   *
   * @param userId Owner of the key
   * @param data   Creation payload
   */
  createApiKey(
    userId: string,
    data: ApiKeyCreatePayload,
  ): Promise<ApiKeyCreateResult>;

  /**
   * Revoke an existing API key so it can no longer be used.
   *
   * @param userId Owner of the key
   * @param keyId  Identifier of the key to revoke
   */
  revokeApiKey(
    userId: string,
    keyId: string,
  ): Promise<{ success: boolean; key?: ApiKey; error?: string }>;

  /**
   * Regenerate the secret for an API key.
   *
   * @param userId Owner of the key
   * @param keyId  Identifier of the key
   */
  regenerateApiKey(
    userId: string,
    keyId: string,
  ): Promise<{
    success: boolean;
    key?: ApiKey;
    plaintext?: string;
    error?: string;
  }>;

  /**
   * Validate an API key. Should resolve with `{ valid: boolean }` rather than
   * throwing for invalid keys.
   */
  validateApiKey(
    apiKey: string,
    userId?: string,
  ): Promise<{ valid: boolean; error?: string }>;
}

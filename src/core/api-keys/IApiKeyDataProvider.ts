/**
 * API Key Data Provider Interface
 *
 * Defines the contract for persistence operations related to API keys.
 * Adapter implementations (Supabase, GraphQL, REST, etc.) must implement
 * this interface to allow the service layer to remain database agnostic.
 */
import type {
  ApiKey,
  ApiKeyCreatePayload,
  ApiKeyCreateResult
} from './models';

export interface IApiKeyDataProvider {
  /** List all API keys belonging to a user */
  listApiKeys(userId: string): Promise<ApiKey[]>;

  /** Retrieve a single API key by id */
  getApiKey(userId: string, keyId: string): Promise<ApiKey | null>;

  /**
   * Persist a new API key
   *
   * @param userId Owner of the API key
   * @param data   Key creation payload
   * @returns Result with created key and plaintext value if successful
   */
  createApiKey(
    userId: string,
    data: ApiKeyCreatePayload
  ): Promise<ApiKeyCreateResult>;

  /**
   * Mark an API key as revoked
   *
   * @param userId Owner of the API key
   * @param keyId  Identifier of the key to revoke
   * @returns Operation result with updated key when successful
   */
  revokeApiKey(
    userId: string,
    keyId: string
  ): Promise<{ success: boolean; key?: ApiKey; error?: string }>;

  /**
   * Generate a new secret for an existing key
   *
   * @param userId Owner of the API key
   * @param keyId  Identifier of the key to regenerate
   * @returns Operation result with new plaintext secret when successful
   */
  regenerateApiKey(
    userId: string,
    keyId: string
  ): Promise<{ success: boolean; key?: ApiKey; plaintext?: string; error?: string }>;
}

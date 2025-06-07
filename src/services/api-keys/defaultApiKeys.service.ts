import { ApiKeyService } from '@/core/apiKeys/interfaces'0;
import type { IApiKeyDataProvider } from '@/core/apiKeys/IApiKeyDataProvider'61;
import type { ApiKey, ApiKeyCreatePayload, ApiKeyCreateResult } from '@/core/apiKeys/models'142;
import { getKeyPrefix } from '@/lib/apiKeys/apiKeyUtils'238;
import { SubscriptionTier } from '@/core/subscription/models';
import { ensureSubscriptionTier } from '@/services/subscription/subscriptionAccess'364;

/**
 * Default implementation of the {@link ApiKeyService} interface.
 *
 * This service contains high level business logic for managing API keys
 * while delegating persistence to the injected {@link IApiKeyDataProvider}.
 */
export class DefaultApiKeysService implements ApiKeyService {
  constructor(private provider: IApiKeyDataProvider) {}

  /** @inheritdoc */
  async listApiKeys(userId: string): Promise<ApiKey[]> {
    await ensureSubscriptionTier(userId, SubscriptionTier.PREMIUM);
    return this.provider.listApiKeys(userId);
  }

  /** @inheritdoc */
  async createApiKey(userId: string, data: ApiKeyCreatePayload): Promise<ApiKeyCreateResult> {
    await ensureSubscriptionTier(userId, SubscriptionTier.PREMIUM);
    return this.provider.createApiKey(userId, data);
  }

  /** @inheritdoc */
  async revokeApiKey(
    userId: string,
    keyId: string
  ): Promise<{ success: boolean; key?: ApiKey; error?: string }> {
    await ensureSubscriptionTier(userId, SubscriptionTier.PREMIUM);
    return this.provider.revokeApiKey(userId, keyId);
  }

  /** @inheritdoc */
  async regenerateApiKey(
    userId: string,
    keyId: string
  ): Promise<{ success: boolean; key?: ApiKey; plaintext?: string; error?: string }> {
    await ensureSubscriptionTier(userId, SubscriptionTier.PREMIUM);
    return this.provider.regenerateApiKey(userId, keyId);
  }

  /** @inheritdoc */
  async validateApiKey(apiKey: string, userId?: string): Promise<{ valid: boolean; error?: string }> {
    if (!userId) {
      return { valid: false, error: 'User id is required' };
    }
    try {
      await ensureSubscriptionTier(userId, SubscriptionTier.PREMIUM);
      const prefix = getKeyPrefix(apiKey);
      const keys = await this.provider.listApiKeys(userId);
      const match = keys.find(k => k.prefix === prefix && !k.isRevoked);
      if (!match) {
        return { valid: false, error: 'API key not found' };
      }
      if (match.expiresAt && new Date(match.expiresAt) < new Date()) {
        return { valid: false, error: 'API key expired' };
      }
      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }
}

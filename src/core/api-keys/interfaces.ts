import type { ApiKey } from './types';

export interface ApiKeyService {
  listApiKeys(): Promise<ApiKey[]>;
  createApiKey(
    name: string,
    permissions: string[],
    expiresInDays?: number
  ): Promise<{ key: string } & ApiKey>;
  revokeApiKey(id: string): Promise<void>;
  regenerateApiKey(id: string): Promise<{ key: string } & ApiKey>;
  validateApiKey(apiKey: string): Promise<boolean>;
}

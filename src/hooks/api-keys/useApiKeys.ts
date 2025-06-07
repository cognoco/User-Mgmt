import { useCallback, useEffect, useState } from 'react';
import { UserManagementConfiguration } from '@/core/config';
import type { ApiKeyService } from '@/core/apiKeys/interfaces';
import type { ApiKey } from '@/core/apiKeys/types';

export function useApiKeys() {
  const apiKeyService =
    UserManagementConfiguration.getServiceProvider<ApiKeyService>('apiKeyService');

  if (!apiKeyService) {
    throw new Error('ApiKeyService is not registered in the service provider registry');
  }

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const keys = await apiKeyService.listApiKeys();
      setApiKeys(keys);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [apiKeyService]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const createApiKey = useCallback(
    async (name: string, permissions: string[], expiresInDays?: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const key = await apiKeyService.createApiKey(
          name,
          permissions,
          expiresInDays
        );
        setApiKeys((prev) => [...prev, key]);
        return key;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiKeyService]
  );

  const revokeApiKey = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await apiKeyService.revokeApiKey(id);
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiKeyService]
  );

  const regenerateApiKey = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const key = await apiKeyService.regenerateApiKey(id);
        setApiKeys((prev) => prev.map((k) => (k.id === id ? key : k)));
        return key;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiKeyService]
  );

  const validateApiKey = useCallback(
    async (apiKey: string) => {
      try {
        return await apiKeyService.validateApiKey(apiKey);
      } catch (err) {
        return false;
      }
    },
    [apiKeyService]
  );

  return {
    apiKeys,
    isLoading,
    error,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
    regenerateApiKey,
    validateApiKey
  };
}

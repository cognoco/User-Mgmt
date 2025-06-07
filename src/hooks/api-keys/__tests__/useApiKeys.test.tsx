// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useApiKeys } from '@/src/hooks/api-keys/useApiKeys'164;
import { UserManagementConfiguration } from '@/core/config';
import type { ApiKeyService } from '@/core/apiKeys/interfaces'271;
import type { ApiKey } from '@/core/apiKeys/types'337;

const mockService: ApiKeyService = {
  listApiKeys: vi.fn(),
  createApiKey: vi.fn(),
  revokeApiKey: vi.fn(),
  regenerateApiKey: vi.fn(),
  validateApiKey: vi.fn()
};

describe('useApiKeys', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    UserManagementConfiguration.reset();
    UserManagementConfiguration.configureServiceProviders({ apiKeyService: mockService });
  });

  afterEach(() => {
    UserManagementConfiguration.reset();
  });

  it('fetches api keys on mount', async () => {
    const keys: ApiKey[] = [
      { id: '1', name: 'Test', keyPrefix: 'pref', permissions: [], createdAt: new Date(), isActive: true }
    ];
    vi.mocked(mockService.listApiKeys).mockResolvedValue(keys);

    const { result } = renderHook(() => useApiKeys());

    expect(mockService.listApiKeys).toHaveBeenCalled();
    await act(async () => {
      await result.current.fetchApiKeys();
    });
    expect(result.current.apiKeys).toEqual(keys);
  });

  it('creates api key', async () => {
    const newKey: ApiKey & { key: string } = {
      id: '2',
      name: 'New',
      keyPrefix: 'pref',
      keySecret: 'secret',
      permissions: [],
      createdAt: new Date(),
      isActive: true,
      key: 'secret'
    };
    vi.mocked(mockService.createApiKey).mockResolvedValue(newKey);
    vi.mocked(mockService.listApiKeys).mockResolvedValue([]);
    const { result } = renderHook(() => useApiKeys());
    await act(async () => {
      const res = await result.current.createApiKey('New', []);
      expect(res).toEqual(newKey);
    });
    expect(mockService.createApiKey).toHaveBeenCalledWith('New', [], undefined);
    expect(result.current.apiKeys).toContainEqual(newKey);
  });
});

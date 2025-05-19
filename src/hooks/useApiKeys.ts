import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useApiKeys() {
  const queryClient = useQueryClient();

  // Fetch all API keys
  const {
    data: apiKeys,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await fetch('/api/api-keys');
      if (!res.ok) throw new Error('Failed to fetch API keys');
      const data = await res.json();
      return data.keys;
    },
  });

  // Create API key
  const createApiKey = useMutation({
    mutationFn: async (payload: { name: string; scopes?: string[] }) => {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create API key');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  // Revoke API key
  const revokeApiKey = useMutation({
    mutationFn: async (keyId: string) => {
      const res = await fetch(`/api/api-keys/${keyId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke API key');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  return {
    apiKeys,
    isLoading,
    error,
    refetch,
    createApiKey,
    revokeApiKey,
  };
} 
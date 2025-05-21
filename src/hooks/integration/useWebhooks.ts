import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useWebhooks() {
  const queryClient = useQueryClient();

  // Fetch all webhooks
  const {
    data: webhooks,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const res = await fetch('/api/webhooks');
      if (!res.ok) throw new Error('Failed to fetch webhooks');
      const data = await res.json();
      return data.webhooks;
    },
  });

  // Create webhook
  const createWebhook = useMutation({
    mutationFn: async (payload: { name: string; url: string; events: string[] }) => {
      const res = await fetch('/api/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create webhook');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['webhooks'] }),
  });

  // Delete webhook
  const deleteWebhook = useMutation({
    mutationFn: async (webhookId: string) => {
      const res = await fetch(`/api/webhooks/${webhookId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete webhook');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['webhooks'] }),
  });

  return {
    webhooks,
    isLoading,
    error,
    refetch,
    createWebhook,
    deleteWebhook,
  };
} 
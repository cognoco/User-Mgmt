import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserManagementConfiguration } from '@/core/config';
import type { IWebhookService } from '@/core/webhooks';
import type { Webhook, WebhookCreatePayload, WebhookUpdatePayload, WebhookDelivery } from '@/core/webhooks/models';

export function useWebhooks(userId: string) {
  const queryClient = useQueryClient();
  const webhookService = UserManagementConfiguration.getServiceProvider<IWebhookService>('webhookService');
  const [error, setError] = useState<string | null>(null);

  if (!webhookService) {
    throw new Error('WebhookService is not registered in the service provider registry');
  }

  // Fetch all webhooks
  const {
    data: webhooks = [],
    isLoading,
    refetch: fetchWebhooks,
  } = useQuery<Webhook[]>({
    queryKey: ['webhooks', userId],
    queryFn: async () => {
      try {
        return await webhookService.getWebhooks(userId);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch webhooks';
        setError(message);
        throw err;
      }
    },
  });

  // Create webhook
  const createWebhook = useMutation({
    mutationFn: async (payload: WebhookCreatePayload) => {
      const result = await webhookService.createWebhook(userId, payload);
      if (!result.success) {
        throw new Error(result.error || 'Failed to create webhook');
      }
      return result.webhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', userId] });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Update webhook
  const updateWebhook = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & WebhookUpdatePayload) => {
      const result = await webhookService.updateWebhook(userId, id, payload);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update webhook');
      }
      return result.webhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', userId] });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Delete webhook
  const deleteWebhook = useMutation({
    mutationFn: async (id: string) => {
      const result = await webhookService.deleteWebhook(userId, id);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete webhook');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks', userId] });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Test webhook
  const testWebhook = useCallback(async (id: string): Promise<WebhookDelivery[]> => {
    try {
      return await webhookService.triggerEvent('test', { id }, userId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to test webhook';
      setError(message);
      throw err;
    }
  }, [webhookService, userId]);

  return {
    webhooks,
    loading: isLoading,
    error,
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
  };
}
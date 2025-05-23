import { useState, useCallback } from 'react';
import { UserManagementConfiguration } from '@/core/config';
import type { IWebhookService } from '@/core/webhooks';
import type { Webhook, WebhookCreatePayload, WebhookUpdatePayload, WebhookDelivery } from '@/core/webhooks/models';

export function useWebhooks(userId: string) {
  const webhookService = UserManagementConfiguration.getServiceProvider<IWebhookService>('webhookService');
  if (!webhookService) {
    throw new Error('WebhookService is not registered in the service provider registry');
  }

  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const hooks = await webhookService.getWebhooks(userId);
      setWebhooks(hooks);
      setLoading(false);
      return hooks;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch webhooks';
      setError(message);
      setLoading(false);
      return [];
    }
  }, [webhookService, userId]);

  const createWebhook = useCallback(async (webhook: WebhookCreatePayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await webhookService.createWebhook(userId, webhook);
      if (result.success && result.webhook) {
        setWebhooks(prev => [...prev, result.webhook!]);
      } else if (result.error) {
        setError(result.error);
      }
      setLoading(false);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create webhook';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  }, [webhookService, userId]);

  const updateWebhook = useCallback(async (id: string, webhook: WebhookUpdatePayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await webhookService.updateWebhook(userId, id, webhook);
      if (result.success && result.webhook) {
        setWebhooks(prev => prev.map(w => w.id === id ? result.webhook! : w));
      } else if (result.error) {
        setError(result.error);
      }
      setLoading(false);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update webhook';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  }, [webhookService, userId]);

  const deleteWebhook = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await webhookService.deleteWebhook(userId, id);
      if (result.success) {
        setWebhooks(prev => prev.filter(w => w.id !== id));
      } else if (result.error) {
        setError(result.error);
      }
      setLoading(false);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete webhook';
      setError(message);
      setLoading(false);
      return { success: false, error: message };
    }
  }, [webhookService, userId]);

  const testWebhook = useCallback(async (id: string): Promise<WebhookDelivery[]> => {
    setLoading(true);
    setError(null);
    try {
      const deliveries = await webhookService.triggerEvent('test', { id }, userId);
      setLoading(false);
      return deliveries;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to test webhook';
      setError(message);
      setLoading(false);
      return [];
    }
  }, [webhookService, userId]);

  return {
    webhooks,
    loading,
    error,
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook
  };
}

import React, { useEffect, useCallback } from 'react';
import { useWebhooks } from '@/hooks/webhooks/useWebhooks';
import type { Webhook } from '@/core/webhooks/models';

export interface WebhookListRenderProps {
  webhooks: Webhook[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  remove: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export interface WebhookListProps {
  userId: string;
  children: (props: WebhookListRenderProps) => React.ReactNode;
  onDelete?: (id: string) => Promise<unknown> | void;
}

export function WebhookList({ userId, children, onDelete }: WebhookListProps) {
  const { 
    webhooks = [], 
    fetchWebhooks, 
    deleteWebhook, 
    loading, 
    error 
  } = useWebhooks(userId);

  // Initial data fetch
  useEffect(() => {
    void fetchWebhooks();
  }, [fetchWebhooks]);

  // Handle webhook deletion
  const handleRemove = useCallback(async (id: string) => {
    if (onDelete) {
      return onDelete(id);
    }
    
    try {
      const result = await deleteWebhook.mutateAsync 
        ? deleteWebhook.mutateAsync(id)
        : deleteWebhook(id);
      
      // Refresh the list if needed
      if (result?.success !== false) {
        await fetchWebhooks();
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete webhook';
      return { success: false, error: message };
    }
  }, [deleteWebhook, fetchWebhooks, onDelete]);

  // Refresh handler
  const refresh = useCallback(async () => {
    try {
      await fetchWebhooks();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh webhooks';
      return { success: false, error: message };
    }
  }, [fetchWebhooks]);

  return children({ 
    webhooks, 
    loading, 
    error, 
    refresh, 
    remove: handleRemove 
  });
}

import React, { useEffect } from 'react';
import { useWebhooks } from '@/hooks/webhooks/use-webhooks';
import type { Webhook } from '@/core/webhooks/models';

export interface WebhookListProps {
  userId: string;
  children: (props: { webhooks: Webhook[]; refresh: () => Promise<void>; loading: boolean; error: string | null }) => React.ReactNode;
}

export function WebhookList({ userId, children }: WebhookListProps) {
  const { webhooks, fetchWebhooks, loading, error } = useWebhooks(userId);

  useEffect(() => {
    void fetchWebhooks();
  }, [fetchWebhooks]);

  return <>{children({ webhooks, refresh: fetchWebhooks, loading, error })}</>;
}

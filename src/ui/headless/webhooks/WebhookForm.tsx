import React, { useState } from 'react';
import { useWebhooks } from '@/hooks/webhooks/use-webhooks';
import type { WebhookCreatePayload } from '@/core/webhooks/models';

export interface WebhookFormProps {
  userId: string;
  onSubmit?: (data: WebhookCreatePayload) => Promise<void>;
  children: (props: { data: WebhookCreatePayload; setData: (d: WebhookCreatePayload) => void; submit: () => Promise<void>; loading: boolean; error: string | null }) => React.ReactNode;
}

export function WebhookForm({ userId, onSubmit, children }: WebhookFormProps) {
  const { createWebhook } = useWebhooks(userId);
  const [data, setData] = useState<WebhookCreatePayload>({ name: '', url: '', events: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (onSubmit) await onSubmit(data);
      else await createWebhook(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return <>{children({ data, setData, submit, loading, error })}</>;
}

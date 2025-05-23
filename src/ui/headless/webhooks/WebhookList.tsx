import type { Webhook } from '@/core/webhooks/models';
import { useWebhooks } from '@/hooks/webhooks/use-webhooks';

export interface WebhookListRenderProps {
  webhooks: Webhook[];
  loading: boolean;
  error: unknown;
  remove: (id: string) => Promise<unknown>;
}

export interface WebhookListProps {
  children: (props: WebhookListRenderProps) => React.ReactNode;
}

export function WebhookList({ children }: WebhookListProps) {
  const { webhooks = [], isLoading, error, deleteWebhook } = useWebhooks();
  const remove = deleteWebhook.mutateAsync ? deleteWebhook.mutateAsync : deleteWebhook as any;
  return <>{children({ webhooks, loading: isLoading, error, remove })}</>;
}

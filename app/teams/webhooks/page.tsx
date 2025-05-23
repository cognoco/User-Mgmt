'use client';
import { WebhookForm } from '@/ui/styled/webhooks/WebhookForm';
import { WebhookList } from '@/ui/styled/webhooks/WebhookList';
import { WebhookEvents } from '@/ui/styled/webhooks/WebhookEvents';
import { useWebhooks } from '@/hooks/webhooks/use-webhooks';

export default function TeamWebhooksPage() {
  const { createWebhook } = useWebhooks();

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold">Webhook Configuration</h1>
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Webhook</h2>
        <WebhookForm availableEvents={['user.created', 'user.deleted']} onSubmit={(payload) => createWebhook.mutateAsync(payload)} />
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Available Events</h3>
          <WebhookEvents />
        </div>
      </div>
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Configured Webhooks</h2>
        <WebhookList />
      </div>
    </div>
  );
}

import { WebhookManager as HeadlessWebhookManager, type WebhookManagerProps } from '@/ui/headless/webhooks/WebhookManager';
import { WebhookForm } from './WebhookForm';
import { WebhookList } from './WebhookList';
import { Alert } from '@/ui/primitives/alert';

export type StyledWebhookManagerProps = Omit<WebhookManagerProps, 'children'> & {
  availableEvents?: string[];
};

export function WebhookManager({ availableEvents = [], ...props }: StyledWebhookManagerProps) {
  return (
    <HeadlessWebhookManager {...props}>
      {({ webhooks, create, update, remove, refresh, loading, error }) => (
        <div className="space-y-4">
          {error && <Alert variant="destructive">{error}</Alert>}
          <WebhookForm userId={props.userId} onSubmit={create} availableEvents={availableEvents} />
          <WebhookList userId={props.userId} onDelete={remove} />
        </div>
      )}
    </HeadlessWebhookManager>
  );
}

export default WebhookManager;

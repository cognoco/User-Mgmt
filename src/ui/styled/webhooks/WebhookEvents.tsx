import { WebhookEvents as HeadlessWebhookEvents } from '@/ui/headless/webhooks/WebhookEvents';

const defaultEvents = ['user.created', 'user.deleted'];

export function WebhookEvents({ events = defaultEvents }: { events?: string[] }) {
  return <HeadlessWebhookEvents events={events} />;
}

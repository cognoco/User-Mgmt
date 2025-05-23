import { Input } from '@/ui/primitives/input';
import { Button } from '@/ui/primitives/button';
import { Checkbox } from '@/ui/primitives/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { WebhookForm as HeadlessWebhookForm } from '@/ui/headless/webhooks/WebhookForm';

export interface WebhookFormProps {
  availableEvents: string[];
  onSubmit: (payload: { name: string; url: string; events: string[] }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function WebhookForm({ availableEvents, onSubmit, loading, error }: WebhookFormProps) {
  return (
    <HeadlessWebhookForm onSubmit={onSubmit} availableEvents={availableEvents} loading={loading} error={error}>
      {({ name, setName, url, setUrl, events, toggleEvent, handleSubmit, isSubmitting, error: formError }) => (
        <Card>
          <CardHeader>
            <CardTitle>Create Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formError && <p className="text-destructive text-sm" role="alert">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <Input value={url} onChange={e => setUrl(e.target.value)} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Events</p>
                {availableEvents.map(ev => (
                  <label key={ev} className="flex items-center space-x-2 text-sm">
                    <Checkbox checked={events.includes(ev)} onCheckedChange={() => toggleEvent(ev)} />
                    <span>{ev}</span>
                  </label>
                ))}
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Creating...' : 'Create Webhook'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </HeadlessWebhookForm>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { WebhookList as HeadlessWebhookList } from '@/ui/headless/webhooks/WebhookList';

export function WebhookList() {
  return (
    <HeadlessWebhookList>
      {({ webhooks, loading, error, remove }) => (
        <div className="space-y-4">
          {loading && <p>Loading...</p>}
          {error && <p className="text-destructive text-sm" role="alert">{String(error)}</p>}
          {webhooks.map((hook) => (
            <Card key={hook.id} className="flex flex-col md:flex-row md:items-center md:justify-between">
              <CardHeader>
                <CardTitle>{hook.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-mono text-sm break-all">{hook.url}</p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="destructive" onClick={() => remove(hook.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </HeadlessWebhookList>
  );
}

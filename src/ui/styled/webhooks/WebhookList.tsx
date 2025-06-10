import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { WebhookList as HeadlessWebhookList } from '@/ui/headless/webhooks/WebhookList';
import type { Webhook } from '@/core/webhooks/models';

interface WebhookListProps {
  userId: string;
  onDelete?: (id: string) => Promise<unknown> | void;
  children?: (props: {
    webhooks: Webhook[];
    refresh: () => Promise<void>;
    remove: (id: string) => Promise<{ success: boolean; error?: string }>;
    loading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

export function WebhookList({ userId, onDelete, children }: WebhookListProps) {
  const renderDefault = ({ 
    webhooks, 
    refresh, 
    remove, 
    loading, 
    error 
  }: {
    webhooks: Webhook[];
    refresh: () => Promise<void>;
    remove: (id: string) => Promise<{ success: boolean; error?: string }>;
    loading: boolean;
    error: string | null;
  }) => {
    const handleDelete = async (id: string) => {
      const result = await remove(id);
      if (result?.success) {
        await refresh();
      }
      return result;
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Webhooks</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {loading && !webhooks.length && <p>Loading webhooks...</p>}
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="flex flex-col md:flex-row md:items-center md:justify-between">
              <CardHeader className="flex-1">
                <CardTitle className="text-lg">{webhook.name}</CardTitle>
                <p className="font-mono text-sm text-muted-foreground break-all">
                  {webhook.url}
                </p>
                {webhook.events?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {webhook.events.map(event => (
                      <span 
                        key={event} 
                        className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="pt-6 md:pt-0 md:pl-0">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(webhook.id)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}

          {!loading && webhooks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No webhooks found</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={refresh}
              >
                Refresh
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <HeadlessWebhookList userId={userId} onDelete={onDelete}>
      {children || renderDefault}
    </HeadlessWebhookList>
  );
}

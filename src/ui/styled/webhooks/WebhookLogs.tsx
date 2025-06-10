import React from 'react';
import type { WebhookDelivery } from '@/core/webhooks/models';

export function WebhookLogs({ logs }: { logs: WebhookDelivery[] }) {
  return (
    <ul>
      {logs.map(l => (
        <li key={l.id}>{l.eventType} - {l.statusCode}</li>
      ))}
    </ul>
  );
}

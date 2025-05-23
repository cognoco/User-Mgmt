import React from 'react';
import { WebhookList as HeadlessWebhookList } from '../../headless/webhooks/WebhookList';

export function WebhookList(props: any) {
  return (
    <HeadlessWebhookList {...props}>
      {({ webhooks, refresh, loading, error }) => (
        <div>
          <button onClick={refresh}>Refresh</button>
          {loading && <p>Loading...</p>}
          {error && <p>{error}</p>}
          <ul>
            {webhooks.map(w => (
              <li key={w.id}>{w.name}</li>
            ))}
          </ul>
        </div>
      )}
    </HeadlessWebhookList>
  );
}

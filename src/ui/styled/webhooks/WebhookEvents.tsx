import React from 'react';
import { WebhookEvents as HeadlessWebhookEvents } from '../../headless/webhooks/WebhookEvents';
import { Checkbox } from '@/ui/primitives/checkbox';

export function WebhookEvents(props: any) {
  return (
    <HeadlessWebhookEvents {...props}>
      {({ selected, toggle }) => (
        <div>
          {props.available.map((ev: string) => (
            <label key={ev} className="block">
              <Checkbox checked={selected.includes(ev)} onCheckedChange={() => toggle(ev)} /> {ev}
            </label>
          ))}
        </div>
      )}
    </HeadlessWebhookEvents>
  );
}

import React from 'react';
import { WebhookForm as HeadlessWebhookForm } from '../../headless/webhooks/WebhookForm';
import { Input } from '@/ui/primitives/input';
import { Button } from '@/ui/primitives/button';

export function WebhookForm(props: any) {
  return (
    <HeadlessWebhookForm {...props}>
      {({ data, setData, submit, loading, error }) => (
        <form onSubmit={e => { e.preventDefault(); submit(); }}>
          {error && <p>{error}</p>}
          <Input value={data.name} onChange={e => setData({ ...data, name: e.target.value })} placeholder="Name" />
          <Input value={data.url} onChange={e => setData({ ...data, url: e.target.value })} placeholder="URL" />
          <Button type="submit" disabled={loading}>Save</Button>
        </form>
      )}
    </HeadlessWebhookForm>
  );
}

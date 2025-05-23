import { describe, it, expect, beforeEach } from 'vitest';
import { SupabaseWebhookProvider } from '../SupabaseWebhookProvider';
import { setTableMockData, resetSupabaseMock } from '@/tests/mocks/supabase';

const SUPABASE_URL = 'http://localhost';
const SUPABASE_KEY = 'anon';

const webhookRecord = {
  id: 'wh-1',
  user_id: 'user-1',
  url: 'https://example.com',
  events: ['user.created'],
  secret: 'secret',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

describe('SupabaseWebhookProvider', () => {
  beforeEach(() => {
    resetSupabaseMock();
    setTableMockData('webhooks', { data: [webhookRecord], error: null });
  });

  it('lists webhooks for a user', async () => {
    const provider = new SupabaseWebhookProvider(SUPABASE_URL, SUPABASE_KEY);
    const hooks = await provider.listWebhooks('user-1');
    expect(hooks[0]?.id).toBe('wh-1');
  });

  it('fetches a webhook by id', async () => {
    const provider = new SupabaseWebhookProvider(SUPABASE_URL, SUPABASE_KEY);
    const hook = await provider.getWebhook('user-1', 'wh-1');
    expect(hook?.id).toBe('wh-1');
  });

  it('creates a webhook', async () => {
    setTableMockData('webhooks', { data: webhookRecord, error: null });
    const provider = new SupabaseWebhookProvider(SUPABASE_URL, SUPABASE_KEY);
    const result = await provider.createWebhook('user-1', {
      name: 'h',
      url: 'https://example.com',
      events: ['user.created'],
      isActive: true
    });
    expect(result.success).toBe(true);
  });

  it('updates a webhook', async () => {
    setTableMockData('webhooks', { data: { ...webhookRecord, url: 'https://new.url' }, error: null });
    const provider = new SupabaseWebhookProvider(SUPABASE_URL, SUPABASE_KEY);
    const result = await provider.updateWebhook('user-1', 'wh-1', { url: 'https://new.url' });
    expect(result.success).toBe(true);
  });

  it('deletes a webhook', async () => {
    setTableMockData('webhooks', { data: null, error: null });
    const provider = new SupabaseWebhookProvider(SUPABASE_URL, SUPABASE_KEY);
    const result = await provider.deleteWebhook('user-1', 'wh-1');
    expect(result.success).toBe(true);
  });
});

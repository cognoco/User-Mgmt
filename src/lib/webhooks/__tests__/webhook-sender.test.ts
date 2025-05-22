import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createWebhookSender } from '../webhook-sender';
import type { IWebhookDataProvider } from '@/core/webhooks';
import crypto from 'crypto';

// Mock fetch
(global.fetch as any) = vi.fn();

vi.mock('crypto', () => ({
  createHmac: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn().mockReturnValue('mocked-signature')
  })
}));

describe('webhook sender', () => {
  let provider: IWebhookDataProvider & Record<string, any>;
  let sendWebhookEvent: ReturnType<typeof createWebhookSender>['sendWebhookEvent'];
  let getWebhookDeliveries: ReturnType<typeof createWebhookSender>['getWebhookDeliveries'];

  beforeEach(() => {
    (global.fetch as any).mockReset();
    provider = {
      listWebhooks: vi.fn(),
      getWebhook: vi.fn(),
      createWebhook: vi.fn(),
      updateWebhook: vi.fn(),
      deleteWebhook: vi.fn(),
      listDeliveries: vi.fn(),
      recordDelivery: vi.fn()
    } as unknown as IWebhookDataProvider & Record<string, any>;

    ({ sendWebhookEvent, getWebhookDeliveries } = createWebhookSender(provider));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches webhooks for the user', async () => {
    provider.listWebhooks.mockResolvedValueOnce([]);
    await sendWebhookEvent('user.created', {}, 'user-1');
    expect(provider.listWebhooks).toHaveBeenCalledWith('user-1');
  });

  it('sends events to matching webhooks', async () => {
    provider.listWebhooks.mockResolvedValueOnce([
      { id: 'w1', url: 'https://a.com', secret: 's', events: ['user.created'], isActive: true },
      { id: 'w2', url: 'https://b.com', secret: 's2', events: ['other'], isActive: true }
    ]);
    provider.recordDelivery.mockResolvedValue(undefined);
    (global.fetch as any).mockResolvedValue({ ok: true, status: 200, text: async () => 'ok' });

    const results = await sendWebhookEvent('user.created', { id: 1 }, 'user');

    expect((global.fetch as any)).toHaveBeenCalledTimes(1);
    expect(results[0].webhookId).toBe('w1');
  });

  it('records failures', async () => {
    provider.listWebhooks.mockResolvedValueOnce([
      { id: 'w1', url: 'https://a.com', secret: 's', events: ['user.created'], isActive: true }
    ]);
    provider.recordDelivery.mockResolvedValue(undefined);
    (global.fetch as any).mockRejectedValue(new Error('fail'));

    const results = await sendWebhookEvent('user.created', {}, 'user');

    expect(results[0].success).toBe(false);
    expect(provider.recordDelivery).toHaveBeenCalled();
  });

  it('signs payload with secret', async () => {
    provider.listWebhooks.mockResolvedValueOnce([
      { id: 'w1', url: 'https://a.com', secret: 'secret', events: ['e'], isActive: true }
    ]);
    provider.recordDelivery.mockResolvedValue(undefined);
    (global.fetch as any).mockResolvedValue({ ok: true, status: 200, text: async () => '' });

    await sendWebhookEvent('e', {}, 'user');

    expect(crypto.createHmac).toHaveBeenCalledWith('sha256', 'secret');
  });

  it('gets deliveries via provider', async () => {
    provider.listDeliveries.mockResolvedValueOnce([{ id: 'd', webhookId: 'w', eventType: 'e', createdAt: '' }]);
    const res = await getWebhookDeliveries('user', 'w');
    expect(provider.listDeliveries).toHaveBeenCalledWith('user', 'w', 10);
    expect(res.length).toBe(1);
  });
});

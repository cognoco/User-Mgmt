import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';

vi.mock('@/lib/payments/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn()
    }
  }
}));

vi.mock('@/adapters/subscription/supabase/supabase-subscription.provider', () => ({
  SupabaseSubscriptionProvider: vi.fn().mockImplementation(() => ({
    upsertSubscription: vi.fn().mockResolvedValue(undefined)
  }))
}));

const { stripe } = require('@/lib/payments/stripe');
const { SupabaseSubscriptionProvider } = require('@/adapters/subscription/supabase/supabase-subscription.provider');

function createRequest(body: any, signature = 'sig') {
  return new Request('http://localhost', {
    method: 'POST',
    headers: { 'stripe-signature': signature },
    body: JSON.stringify(body)
  });
}

describe('/api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 for invalid signature', async () => {
    stripe.webhooks.constructEvent.mockImplementation(() => { throw new Error('bad'); });
    const res = await POST(createRequest({}));
    expect(res.status).toBe(400);
  });

  it('handles subscription events', async () => {
    stripe.webhooks.constructEvent.mockReturnValue({
      type: 'customer.subscription.updated',
      data: { object: { id: 'sub', metadata: { user_id: 'u1' }, items: { data: [{ price: { id: 'price' } }] }, start_date: 0, current_period_end: 0 } }
    });
    const res = await POST(createRequest({}));
    expect(res.status).toBe(200);
    const Provider = SupabaseSubscriptionProvider as any;
    expect(Provider).toHaveBeenCalled();
    const instance = Provider.mock.results[0].value;
    expect(instance.upsertSubscription).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { createCheckoutSession } from '@/lib/payments/stripe';

vi.mock('@/lib/payments/stripe', () => ({
  createCheckoutSession: vi.fn(),
}));

describe('subscriptions checkout API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates checkout session', async () => {
    vi.mocked(createCheckoutSession).mockResolvedValue({ url: 'https://stripe.test' } as any);
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ plan: 'price_123' }) });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://stripe.test');
    expect(createCheckoutSession).toHaveBeenCalled();
  });

  it('returns 400 on invalid payload', async () => {
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({}) });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});

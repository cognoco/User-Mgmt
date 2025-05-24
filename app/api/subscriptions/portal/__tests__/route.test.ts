import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { createBillingPortalSession } from '@/lib/payments/stripe';

vi.mock('@/lib/payments/stripe', () => ({
  createBillingPortalSession: vi.fn(),
}));

describe('subscriptions portal API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates portal session', async () => {
    vi.mocked(createBillingPortalSession).mockResolvedValue({ url: 'https://portal.test' } as any);
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ customerId: 'cus_123' }) });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe('https://portal.test');
    expect(createBillingPortalSession).toHaveBeenCalled();
  });

  it('returns 400 on invalid payload', async () => {
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({}) });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });
});

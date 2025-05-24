import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { getApiSubscriptionService } from '@/services/subscription/factory';

vi.mock('@/services/subscription/factory', () => ({
  getApiSubscriptionService: vi.fn(),
}));

describe('subscriptions cancel API', () => {
  const service = {
    cancelSubscription: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.mocked(getApiSubscriptionService).mockReturnValue(service);
    vi.clearAllMocks();
  });

  it('cancels subscription', async () => {
    service.cancelSubscription.mockResolvedValue({ success: true });
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ subscriptionId: 'sub1' }) });
    req.headers.set('x-user-id', 'u1');
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(service.cancelSubscription).toHaveBeenCalledWith('sub1', undefined);
  });

  it('returns 400 for invalid payload', async () => {
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({}) });
    req.headers.set('x-user-id', 'u1');
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('requires auth', async () => {
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ subscriptionId: 'sub1' }) });
    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });
});

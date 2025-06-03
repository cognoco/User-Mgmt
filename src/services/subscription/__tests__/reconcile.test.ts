import { describe, it, expect, vi } from 'vitest';
import { DefaultSubscriptionService } from '../default-subscription.service';
import type { ISubscriptionDataProvider } from '@/core/subscription';

const provider: ISubscriptionDataProvider = {
  getPlans: vi.fn(),
  getUserSubscription: vi.fn(),
  createSubscription: vi.fn(),
  updateSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
  upsertSubscription: vi.fn().mockResolvedValue({ id: '1' } as any),
  listSubscriptions: vi.fn(),
};

describe('DefaultSubscriptionService.reconcileSubscription', () => {
  it('delegates to provider', async () => {
    const svc = new DefaultSubscriptionService(provider);
    const payload = { userId: 'u1', planId: 'p1' };
    const result = await svc.reconcileSubscription(payload);
    expect(provider.upsertSubscription).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ id: '1' });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useSubscriptionStore } from '../subscription.store';
import { api } from '../../api/axios';
import { SubscriptionTier, SubscriptionPeriod } from '../../types/subscription';

// Mock axios api
vi.mock('../../api/axios', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

// Mock UserManagementProvider
vi.mock('../../UserManagementProvider', () => ({
  useUserManagement: () => ({
    userManagement: {
      subscription: {
        enabled: true,
        defaultTier: 'free',
        features: {
          premium_feature: {
            tier: 'premium',
            description: 'Premium feature',
          },
        },
      },
    },
  }),
}));

describe('useSubscriptionStore', () => {
  const mockPlans = [
    {
      id: 'free-plan',
      name: 'Free',
      tier: SubscriptionTier.FREE,
      price: 0,
      period: SubscriptionPeriod.MONTHLY,
      features: ['basic_feature'],
      isPublic: true,
    },
    {
      id: 'premium-plan',
      name: 'Premium',
      tier: SubscriptionTier.PREMIUM,
      price: 10,
      period: SubscriptionPeriod.MONTHLY,
      features: ['premium_feature'],
      isPublic: true,
    },
  ];

  const mockSubscription = {
    id: 'sub-123',
    userId: 'user-123',
    planId: 'premium-plan',
    status: 'active',
    startDate: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const store = useSubscriptionStore.getState();
    store.plans = [];
    store.userSubscription = null;
    store.error = null;
    store.isLoading = false;
  });

  describe('fetchPlans', () => {
    it('should fetch and set subscription plans', async () => {
      (api.get as any).mockResolvedValueOnce({ data: mockPlans });

      await act(async () => {
        const result = await useSubscriptionStore.getState().fetchPlans();
        expect(result).toEqual(mockPlans);
      });

      const store = useSubscriptionStore.getState();
      expect(store.plans).toEqual(mockPlans);
      expect(store.error).toBeNull();
      expect(api.get).toHaveBeenCalledWith('/subscriptions/plans');
    });

    it('should handle fetch plans error', async () => {
      const error = new Error('Failed to fetch plans');
      (api.get as any).mockRejectedValueOnce(error);

      await act(async () => {
        const result = await useSubscriptionStore.getState().fetchPlans();
        expect(result).toEqual([]);
      });

      const store = useSubscriptionStore.getState();
      expect(store.error).toBe('Failed to fetch subscription plans');
      expect(store.plans).toEqual([]);
    });
  });

  describe('fetchUserSubscription', () => {
    it('should fetch and set user subscription', async () => {
      (api.get as any).mockResolvedValueOnce({ data: mockSubscription });

      await act(async () => {
        const result = await useSubscriptionStore.getState().fetchUserSubscription('user-123');
        expect(result).toEqual(mockSubscription);
      });

      const store = useSubscriptionStore.getState();
      expect(store.userSubscription).toEqual(mockSubscription);
      expect(store.error).toBeNull();
      expect(api.get).toHaveBeenCalledWith('/subscriptions/users/user-123');
    });

    it('should handle 404 response gracefully', async () => {
      const error = { response: { status: 404 } };
      (api.get as any).mockRejectedValueOnce(error);

      await act(async () => {
        const result = await useSubscriptionStore.getState().fetchUserSubscription('user-123');
        expect(result).toBeNull();
      });

      const store = useSubscriptionStore.getState();
      expect(store.userSubscription).toBeNull();
      expect(store.error).toBeNull();
    });

    it('should handle fetch user subscription error', async () => {
      const error = new Error('Failed to fetch subscription');
      (api.get as any).mockRejectedValueOnce(error);

      await act(async () => {
        const result = await useSubscriptionStore.getState().fetchUserSubscription('user-123');
        expect(result).toBeNull();
      });

      const store = useSubscriptionStore.getState();
      expect(store.error).toBe('Failed to fetch user subscription');
      expect(store.userSubscription).toBeNull();
    });
  });

  describe('isSubscribed', () => {
    it('should return false when no subscription exists', () => {
      const store = useSubscriptionStore.getState();
      expect(store.isSubscribed()).toBe(false);
    });

    it('should return true for active premium subscription', () => {
      const store = useSubscriptionStore.getState();
      store.plans = mockPlans;
      store.userSubscription = mockSubscription;
      expect(store.isSubscribed()).toBe(true);
    });

    it('should return false for free tier subscription', () => {
      const store = useSubscriptionStore.getState();
      store.plans = mockPlans;
      store.userSubscription = {
        ...mockSubscription,
        planId: 'free-plan',
      };
      expect(store.isSubscribed()).toBe(false);
    });
  });

  describe('hasFeature', () => {
    it('should return true for features available in user tier', () => {
      const store = useSubscriptionStore.getState();
      store.plans = mockPlans;
      store.userSubscription = mockSubscription;
      expect(store.hasFeature('premium_feature')).toBe(true);
    });

    it('should return false for features not available in user tier', () => {
      const store = useSubscriptionStore.getState();
      store.plans = mockPlans;
      store.userSubscription = {
        ...mockSubscription,
        planId: 'free-plan',
      };
      expect(store.hasFeature('premium_feature')).toBe(false);
    });

    it('should return true for unconfigured features', () => {
      const store = useSubscriptionStore.getState();
      store.plans = mockPlans;
      store.userSubscription = mockSubscription;
      expect(store.hasFeature('unconfigured_feature')).toBe(true);
    });
  });
}); 
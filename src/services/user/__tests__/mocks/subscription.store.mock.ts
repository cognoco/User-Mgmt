// src/tests/mocks/subscription.store.mock.ts
// Robust mock factory for useSubscriptionStore (Zustand)
// Usage: import { createMockSubscriptionStore } from '@/services/user/__tests__/mocks/subscription.store.mock';
//        const mockStore = createMockSubscriptionStore({ userSubscription: { ... } }, { subscribe: vi.fn() });
//        vi.mock('@/lib/stores/subscription.store', () => ({ useSubscriptionStore: vi.fn(() => mockStore) }));

import { vi } from 'vitest';
import type { SubscriptionState, SubscriptionPlan, UserSubscription } from '@/types/subscription';
import { SubscriptionTier } from '@/types/subscription';

const promisePlans = vi.fn(async () => [] as SubscriptionPlan[]);
const promiseUserSubscription = vi.fn(async () => null as UserSubscription | null);
const promiseSubscribe = vi.fn(async () => ({} as UserSubscription));
const promiseVoid = vi.fn(async () => {});
const defaultTier = SubscriptionTier.FREE;

// Default initial state matching the real store
const defaultState: SubscriptionState = {
  plans: [],
  userSubscription: null,
  isLoading: false,
  error: null,
  fetchPlans: promisePlans,
  fetchUserSubscription: promiseUserSubscription,
  subscribe: promiseSubscribe,
  cancelSubscription: promiseVoid,
  updateSubscription: promiseSubscribe,
  isSubscribed: vi.fn(() => false),
  hasFeature: vi.fn(() => false),
  getTier: vi.fn(() => defaultTier),
  getRemainingTrialDays: vi.fn(() => null),
  clearError: vi.fn(),
};

// Factory to create a robust mock store
export function createMockSubscriptionStore(
  initialState: Partial<SubscriptionState> = {},
  methodOverrides: Partial<Record<keyof SubscriptionState, any>> = {}
) {
  // All methods from the real store, mocked (overridable)
  const store: any = {
    ...defaultState,
    ...initialState,
    getState: () => store,
    setState: (partial: Partial<SubscriptionState>, replace = false) => {
      const newState = replace ? { ...defaultState, ...partial } : { ...store, ...partial };
      for (const key of Object.keys(newState)) {
        store[key] = newState[key];
      }
    },
    fetchPlans: methodOverrides.fetchPlans || defaultState.fetchPlans,
    fetchUserSubscription: methodOverrides.fetchUserSubscription || defaultState.fetchUserSubscription,
    subscribe: methodOverrides.subscribe || defaultState.subscribe,
    cancelSubscription: methodOverrides.cancelSubscription || defaultState.cancelSubscription,
    updateSubscription: methodOverrides.updateSubscription || defaultState.updateSubscription,
    isSubscribed: methodOverrides.isSubscribed || defaultState.isSubscribed,
    hasFeature: methodOverrides.hasFeature || defaultState.hasFeature,
    getTier: methodOverrides.getTier || defaultState.getTier,
    getRemainingTrialDays: methodOverrides.getRemainingTrialDays || defaultState.getRemainingTrialDays,
    clearError: methodOverrides.clearError || defaultState.clearError,
  };

  // Allow direct state mutation for tests
  store.__setState = (partial: Partial<SubscriptionState>, replace = false) => store.setState(partial, replace);

  // Create a function that returns the store
  function useSubscriptionStore() {
    return store;
  }
  // Attach Zustand-like static methods
  useSubscriptionStore.getState = store.getState;
  useSubscriptionStore.setState = store.setState;
  useSubscriptionStore.subscribe = vi.fn(); // no-op
  useSubscriptionStore.destroy = vi.fn(); // no-op

  return useSubscriptionStore;
}

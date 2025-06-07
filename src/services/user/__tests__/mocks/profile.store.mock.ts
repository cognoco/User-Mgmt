// src/tests/mocks/profile.store.mock.ts
// Robust mock factory for useProfileStore (Zustand)
// Usage: import { createMockProfileStore } from '@/src/services/user/__tests__/mocks/profile.store.mock';
//        const mockStore = createMockProfileStore({ profile: { ... } }, { updateProfile: vi.fn() });
//        vi.mock('@/lib/stores/profile.store', () => ({ useProfileStore: vi.fn(() => mockStore) }));

import { vi } from 'vitest';
import type { Profile, ProfileVerification } from '@/types/profile';

// Default initial state matching the real store
const defaultState = {
  profile: null as Profile | null,
  isLoading: false,
  error: null as string | null,
  verification: null as ProfileVerification | null,
  verificationLoading: false,
  verificationError: null as string | null,
  fetchProfile: vi.fn(async () => {}),
  updateBusinessProfile: vi.fn(async () => {}),
  updateProfile: vi.fn(async () => {}),
  convertToBusinessProfile: vi.fn(async () => {}),
  uploadAvatar: vi.fn(async () => 'mock-avatar-url'),
  removeAvatar: vi.fn(async () => true),
  uploadCompanyLogo: vi.fn(async () => 'mock-logo-url'),
  removeCompanyLogo: vi.fn(async () => true),
  clearError: vi.fn(),
  fetchVerificationStatus: vi.fn(async () => {}),
  requestVerification: vi.fn(async () => {}),
};

// Factory to create a robust mock store
export function createMockProfileStore(
  initialState: Partial<typeof defaultState> = {},
  methodOverrides: Partial<Record<keyof typeof defaultState, any>> = {}
) {
  // All methods from the real store, mocked (overridable)
  const store: any = {
    ...defaultState,
    ...initialState,
    getState: () => store,
    setState: (partial: Partial<typeof defaultState>, replace = false) => {
      const newState = replace ? { ...defaultState, ...partial } : { ...store, ...partial };
      for (const key of Object.keys(newState)) {
        store[key] = newState[key];
      }
    },
    fetchProfile: methodOverrides.fetchProfile || defaultState.fetchProfile,
    updateBusinessProfile: methodOverrides.updateBusinessProfile || defaultState.updateBusinessProfile,
    updateProfile: methodOverrides.updateProfile || defaultState.updateProfile,
    convertToBusinessProfile: methodOverrides.convertToBusinessProfile || defaultState.convertToBusinessProfile,
    uploadAvatar: methodOverrides.uploadAvatar || defaultState.uploadAvatar,
    removeAvatar: methodOverrides.removeAvatar || defaultState.removeAvatar,
    uploadCompanyLogo: methodOverrides.uploadCompanyLogo || defaultState.uploadCompanyLogo,
    removeCompanyLogo: methodOverrides.removeCompanyLogo || defaultState.removeCompanyLogo,
    clearError: methodOverrides.clearError || defaultState.clearError,
    fetchVerificationStatus: methodOverrides.fetchVerificationStatus || defaultState.fetchVerificationStatus,
    requestVerification: methodOverrides.requestVerification || defaultState.requestVerification,
  };

  // Allow direct state mutation for tests
  store.__setState = (partial: Partial<typeof defaultState>, replace = false) => store.setState(partial, replace);

  // Create a function that returns the store
  function useProfileStore() {
    return store;
  }
  // Attach Zustand-like static methods
  useProfileStore.getState = store.getState;
  useProfileStore.setState = store.setState;
  useProfileStore.subscribe = vi.fn(); // no-op
  useProfileStore.destroy = vi.fn(); // no-op

  return useProfileStore;
} 
// src/tests/mocks/preferences.store.mock.ts
// Robust mock factory for usePreferencesStore (Zustand)
// Usage: import { createMockPreferencesStore } from '@/src/services/user/__tests__/mocks/preferences.store.mock';
//        const mockStore = createMockPreferencesStore({ preferences: { ... } }, { updatePreferences: vi.fn() });
//        vi.mock('@/lib/stores/preferences.store', () => ({ usePreferencesStore: vi.fn(() => mockStore) }));

import { vi } from 'vitest';
import type { UserPreferences } from '@/types/database';

// Default initial state matching the real store
const defaultState = {
  preferences: null as UserPreferences | null,
  isLoading: false,
  error: null as string | null,
  fetchPreferences: vi.fn(async () => {}),
  updatePreferences: vi.fn(async () => true),
};

// Factory to create a robust mock store
export function createMockPreferencesStore(
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
    fetchPreferences: methodOverrides.fetchPreferences || defaultState.fetchPreferences,
    updatePreferences: methodOverrides.updatePreferences || defaultState.updatePreferences,
  };

  // Allow direct state mutation for tests
  store.__setState = (partial: Partial<typeof defaultState>, replace = false) => store.setState(partial, replace);

  // Create a function that returns the store
  function usePreferencesStore() {
    return store;
  }
  // Attach Zustand-like static methods
  usePreferencesStore.getState = store.getState;
  usePreferencesStore.setState = store.setState;
  usePreferencesStore.subscribe = vi.fn(); // no-op
  usePreferencesStore.destroy = vi.fn(); // no-op

  return usePreferencesStore;
} 
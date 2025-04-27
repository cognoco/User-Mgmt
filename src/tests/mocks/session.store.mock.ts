// src/tests/mocks/session.store.mock.ts
// Robust mock factory for useSessionStore (Zustand)
// Usage: import { createMockSessionStore } from './session.store.mock';
//        const mockStore = createMockSessionStore({ sessions: [...] }, { revokeSession: vi.fn() });
//        vi.mock('@/lib/stores/session.store', () => ({ useSessionStore: vi.fn(() => mockStore) }));

import { vi } from 'vitest';
import type { SessionInfo } from '../../lib/stores/session.store';

// Default initial state matching the real store
const defaultState = {
  sessions: [] as SessionInfo[],
  sessionLoading: false,
  sessionError: null as string | null,
  fetchSessions: vi.fn(async () => {}),
  revokeSession: vi.fn(async () => {}),
};

// Factory to create a robust mock store
export function createMockSessionStore(
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
    fetchSessions: methodOverrides.fetchSessions || defaultState.fetchSessions,
    revokeSession: methodOverrides.revokeSession || defaultState.revokeSession,
  };

  // Allow direct state mutation for tests
  store.__setState = (partial: Partial<typeof defaultState>, replace = false) => store.setState(partial, replace);

  // Create a function that returns the store
  function useSessionStore() {
    return store;
  }
  // Attach Zustand-like static methods
  useSessionStore.getState = store.getState;
  useSessionStore.setState = store.setState;
  useSessionStore.subscribe = vi.fn(); // no-op
  useSessionStore.destroy = vi.fn(); // no-op

  return useSessionStore;
} 
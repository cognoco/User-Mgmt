import { act } from '@testing-library/react';

/**
 * Helper function to create a clean store for testing
 * This ensures each test has a fresh store instance
 * 
 * @param createStore - The store creation function (e.g., useAuthStore)
 * @param initialState - Optional initial state to set
 * @returns A store instance for testing
 */
export function createTestStore<T extends object>(
  createStore: any,
  initialState: Partial<T> = {}
) {
  // Create a fresh store instance
  const store = createStore;
  
  // Set initial state if provided
  if (Object.keys(initialState).length > 0) {
    act(() => {
      store.setState(initialState);
    });
  }
  
  return store;
}

/**
 * Helper function to reset a store to a clean state
 * 
 * @param store - The store to reset
 * @param initialState - The initial state to reset to
 */
export function resetStore<T>(store: any, initialState: Partial<T> = {}) {
  act(() => {
    store.setState(initialState, true); // true = replace state instead of merging
  });
}

/**
 * Helper function to get a store's state safely in tests
 * 
 * @param store - The store to get state from
 * @returns The current state of the store
 */
export function getStoreState<T>(store: any): T {
  return store.getState();
}

/**
 * Helper function to update a store's state safely in tests
 * 
 * @param store - The store to update
 * @param partialState - The partial state to update
 */
export function updateStoreState<T>(store: any, partialState: Partial<T>) {
  act(() => {
    store.setState(partialState);
  });
}
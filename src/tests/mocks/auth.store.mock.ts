// src/tests/mocks/auth.store.mock.ts
// Robust mock factory for useAuthStore (Zustand)
// Usage: import { createMockAuthStore } from './auth.store.mock';
//        const mockStore = createMockAuthStore({ user: { ... } }, { login: vi.fn() });
//        vi.mock('@/lib/stores/auth.store', () => ({ useAuthStore: vi.fn(() => mockStore) }));

import { vi } from 'vitest';
import type { AuthState, AuthResult, MFASetupResponse, MFAVerifyResponse } from '../../types/auth';

const promiseTrue = vi.fn(async () => true);
const promiseAuthResult = vi.fn(async () => ({ success: true } as AuthResult));
const promiseVoid = vi.fn(async () => {});
const promiseMFAVerify = vi.fn(async () => ({ success: true } as MFAVerifyResponse));
const promiseMFASetup = vi.fn(async () => ({ success: true } as MFASetupResponse));
const promiseResetPassword = vi.fn(async () => ({ success: true }));

// Default initial state matching the real store
const defaultState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  successMessage: null,
  rateLimitInfo: null,
  mfaEnabled: false,
  mfaSecret: null,
  mfaQrCode: null,
  mfaBackupCodes: null,
  login: vi.fn(async () => promiseAuthResult()),
  register: vi.fn(async () => promiseAuthResult()),
  logout: promiseVoid,
  resetPassword: vi.fn(async () => promiseResetPassword()),
  updatePassword: promiseVoid,
  sendVerificationEmail: vi.fn(async () => promiseAuthResult()),
  verifyEmail: promiseVoid,
  clearError: vi.fn(),
  clearSuccessMessage: vi.fn(),
  deleteAccount: promiseVoid,
  setUser: vi.fn(),
  setToken: vi.fn(),
  setupMFA: promiseMFASetup,
  verifyMFA: promiseMFAVerify,
  disableMFA: vi.fn(async () => promiseAuthResult()),
  handleSessionTimeout: vi.fn(),
  refreshToken: promiseTrue,
  setLoading: vi.fn(),
};

// Factory to create a robust mock store
export function createMockAuthStore(
  initialState: Partial<AuthState> = {},
  methodOverrides: Partial<Record<keyof AuthState, any>> = {}
) {
  // All methods from the real store, mocked (overridable)
  const store: any = {
    ...defaultState,
    ...initialState,
    getState: () => store,
    setState: (partial: Partial<AuthState>, replace = false) => {
      const newState = replace ? { ...defaultState, ...partial } : { ...store, ...partial };
      for (const key of Object.keys(newState)) {
        store[key] = newState[key];
      }
    },
    login: methodOverrides.login || defaultState.login,
    logout: methodOverrides.logout || defaultState.logout,
    register: methodOverrides.register || defaultState.register,
    refreshToken: methodOverrides.refreshToken || defaultState.refreshToken,
    handleSessionTimeout: methodOverrides.handleSessionTimeout || defaultState.handleSessionTimeout,
    clearError: methodOverrides.clearError || defaultState.clearError,
    clearSuccessMessage: methodOverrides.clearSuccessMessage || defaultState.clearSuccessMessage,
    setUser: methodOverrides.setUser || defaultState.setUser,
    setToken: methodOverrides.setToken || defaultState.setToken,
    setupMFA: methodOverrides.setupMFA || defaultState.setupMFA,
    verifyMFA: methodOverrides.verifyMFA || defaultState.verifyMFA,
    disableMFA: methodOverrides.disableMFA || defaultState.disableMFA,
    sendVerificationEmail: methodOverrides.sendVerificationEmail || defaultState.sendVerificationEmail,
    setLoading: methodOverrides.setLoading || defaultState.setLoading,
    resetPassword: methodOverrides.resetPassword || defaultState.resetPassword,
    updatePassword: methodOverrides.updatePassword || defaultState.updatePassword,
    deleteAccount: methodOverrides.deleteAccount || defaultState.deleteAccount,
    verifyEmail: methodOverrides.verifyEmail || defaultState.verifyEmail,
  };

  // Allow direct state mutation for tests
  store.__setState = (partial: Partial<AuthState>, replace = false) => store.setState(partial, replace);

  // Create a function that returns the store
  function useAuthStore() {
    return store;
  }
  // Attach Zustand-like static methods
  useAuthStore.getState = store.getState;
  useAuthStore.setState = store.setState;
  useAuthStore.subscribe = vi.fn(); // no-op
  useAuthStore.destroy = vi.fn(); // no-op

  return useAuthStore;
} 
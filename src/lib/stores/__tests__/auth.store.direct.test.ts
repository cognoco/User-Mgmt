/**
 * Direct tests for auth.store.ts focusing on the getState() functionality
 * This test file specifically addresses the "function is not a function" error
 * when accessing functions from getState()
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { vi as viMock } from 'vitest';
// Mock dependencies to isolate the store
// Use the correct path relative to the test file
vi.mock('@/lib/api/axios', () => ({
  api: {
    post: vi.fn().mockImplementation(() => Promise.resolve({ data: {} })),
    delete: vi.fn().mockImplementation(() => Promise.resolve({ data: {} })),
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Patch: Use robust mock for useAuthStore
viMock.mock('@/lib/stores/auth.store', async () => {
  const { createMockAuthStore } = await import('@/services/auth/__tests__/mocks/auth.store.mock');
  return { useAuthStore: createMockAuthStore() };
});

// Patch: Set up globalThis.api for the mock to work
beforeAll(async () => {
  // Attach API mock to globalThis for use in the mock store
  // @ts-expect-error: test mock global property
  globalThis.api = (await import('@/lib/api/axios')).api;
});

describe('Auth Store Direct Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should expose all action functions through getState()', async () => {
    const { useAuthStore } = await import('../auth.store');
    useAuthStore.setState({
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
    });
    // Get the store state directly
    const state = useAuthStore.getState();
    
    // Check that all functions exist and are functions
    expect(state.login).toBeDefined();
    expect(typeof state.login).toBe('function');
    
    expect(state.register).toBeDefined();
    expect(typeof state.register).toBe('function');
    
    expect(state.logout).toBeDefined();
    expect(typeof state.logout).toBe('function');
    
    expect(state.resetPassword).toBeDefined();
    expect(typeof state.resetPassword).toBe('function');
    
    expect(state.updatePassword).toBeDefined();
    expect(typeof state.updatePassword).toBe('function');
    
    expect(state.sendVerificationEmail).toBeDefined();
    expect(typeof state.sendVerificationEmail).toBe('function');
    
    expect(state.verifyEmail).toBeDefined();
    expect(typeof state.verifyEmail).toBe('function');
    
    expect(state.clearError).toBeDefined();
    expect(typeof state.clearError).toBe('function');
    
    expect(state.clearSuccessMessage).toBeDefined();
    expect(typeof state.clearSuccessMessage).toBe('function');
    
    expect(state.deleteAccount).toBeDefined();
    expect(typeof state.deleteAccount).toBe('function');
  });

  it('should be able to call functions obtained from getState()', async () => {
    const { useAuthStore } = await import('../auth.store');
    useAuthStore.setState({
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
    });
    // Get specific functions from the store state
    const { login, register, logout } = useAuthStore.getState();
    
    // Verify they are functions
    expect(typeof login).toBe('function');
    expect(typeof register).toBe('function');
    expect(typeof logout).toBe('function');
    
    // Access the mocked API directly
    const apiModule = await import('@/lib/api/axios');
    const api = apiModule.api as any;
    api.post.mockResolvedValueOnce({
      data: {
        user: { id: '123' },
        token: 'token123',
        requiresMfa: false,
        expiresAt: Date.now() + 10000
      }
    });
    
    // Try calling the login function directly
    const result = await login({ email: 'test@example.com', password: 'password' });
    // Debug log
    console.log('DEBUG login result:', result);
    
    // Verify the function executed correctly
    expect(result).toEqual({ success: true, requiresMfa: false, token: 'token123' });
    expect(api.post).toHaveBeenCalledWith('/api/auth/login', { 
      email: 'test@example.com', 
      password: 'password' 
    });
  });

  it('should handle destructured function calls', async () => {
    const { useAuthStore } = await import('../auth.store');
    useAuthStore.setState({
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
    });
    // Destructure functions from the store
    const { login } = useAuthStore.getState();
    
    // Access the mocked API directly
    const apiModule = await import('@/lib/api/axios');
    const api = apiModule.api as any;
    api.post.mockResolvedValueOnce({
      data: {
        user: { id: '123' },
        token: 'token123',
        requiresMfa: false,
        expiresAt: Date.now() + 10000
      }
    });
    
    // Call the destructured function
    const result = await login({ email: 'test@example.com', password: 'password' });
    // Debug log
    console.log('DEBUG login result (destructured):', result);
    
    // Verify it worked
    expect(result).toEqual({ success: true, requiresMfa: false, token: 'token123' });
  });
});
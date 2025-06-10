import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuth } from '@/hooks/auth/useAuth';
import { UserManagementConfiguration } from '@/core/config';
import type { AuthService } from '@/core/auth/interfaces';
import type { AuthDataProvider } from '@/adapters/auth/interfaces';
import { DefaultAuthService } from '@/services/auth/defaultAuth.service';
import type { AuthStorage } from '@/services/auth/authStorage';

// helper to build minimal auth service mocks
function createMockAuthService(): AuthService {
  return {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    sendVerificationEmail: vi.fn(),
    verifyEmail: vi.fn(),
    deleteAccount: vi.fn(),
    setupMFA: vi.fn(),
    verifyMFA: vi.fn(),
    disableMFA: vi.fn(),
    refreshToken: vi.fn(),
    handleSessionTimeout: vi.fn(),
    onAuthStateChanged: vi.fn().mockReturnValue(() => {}),
  };
}

function createMockAdapter(): AuthDataProvider {
  return {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
    sendVerificationEmail: vi.fn(),
    verifyEmail: vi.fn(),
    deleteAccount: vi.fn(),
    setupMFA: vi.fn(),
    verifyMFA: vi.fn(),
    disableMFA: vi.fn(),
    refreshToken: vi.fn(),
    onAuthStateChanged: vi.fn().mockReturnValue(() => {}),
  };
}

describe('useAuth integration', () => {
  beforeEach(() => {
    UserManagementConfiguration.reset();
  });

  afterEach(() => {
    UserManagementConfiguration.reset();
    vi.restoreAllMocks();
  });

  it('calls the auth service from the hook', async () => {
    const service = createMockAuthService();
    (service.login as any).mockResolvedValue({ success: true, user: { id: '1', email: 'a@test.com' } });

    UserManagementConfiguration.configureServiceProviders({ authService: service });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'a@test.com', password: 'pass' });
    });

    expect(service.login).toHaveBeenCalledWith({ email: 'a@test.com', password: 'pass' });
  });

  it('auth service uses the configured adapter', async () => {
    const adapter = createMockAdapter();
    (adapter.login as any).mockResolvedValue({ success: true, user: { id: '2', email: 'b@test.com' } });

    // Minimal service that delegates to adapter
    const service: AuthService = {
      ...createMockAuthService(),
      login: (creds) => adapter.login(creds),
    };

    UserManagementConfiguration.configureServiceProviders({ authService: service });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'b@test.com', password: 'pw' });
    });

    expect(adapter.login).toHaveBeenCalledWith({ email: 'b@test.com', password: 'pw' });
  });

  it('handles API responses and errors from the service', async () => {
    const adapter = createMockAdapter();
    const storage: AuthStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    (adapter.login as any)
      .mockResolvedValueOnce({ success: true, user: { id: '3', email: 'c@test.com' }, token: 'tok' })
      .mockResolvedValueOnce({ success: false, error: 'Invalid credentials' });

    const service = new DefaultAuthService(adapter, storage);
    UserManagementConfiguration.configureServiceProviders({ authService: service });

    const { result } = renderHook(() => useAuth());

    // allow effect subscription to run
    await act(async () => {});

    await act(async () => {
      await result.current.login({ email: 'c@test.com', password: 'good' });
    });

    expect(adapter.login).toHaveBeenCalledWith({ email: 'c@test.com', password: 'good' });

    await act(async () => {
      await result.current.login({ email: 'c@test.com', password: 'bad' });
    });

    expect(result.current.error).toBe('Invalid credentials');
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('exposes verification actions', async () => {
    const service = createMockAuthService();
    (service.sendVerificationEmail as any).mockResolvedValue({ success: true });
    (service.verifyEmail as any).mockResolvedValue(undefined);

    UserManagementConfiguration.configureServiceProviders({ authService: service });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.sendVerificationEmail('me@test.com');
    });

    expect(service.sendVerificationEmail).toHaveBeenCalledWith('me@test.com');

    await act(async () => {
      const res = await result.current.verifyEmail('tok');
      expect(res.success).toBe(true);
    });
    expect(service.verifyEmail).toHaveBeenCalledWith('tok');
  });
});

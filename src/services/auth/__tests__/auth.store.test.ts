import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DefaultAuthService } from '../default-auth.service';
import type { AuthStorage } from '../auth-storage';
import type { IAuthDataProvider } from '@/core/auth/IAuthDataProvider';
import type { AuthResult, LoginPayload } from '@/core/auth/models';

function createAdapter(overrides: Partial<IAuthDataProvider> = {}): IAuthDataProvider {
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
    ...overrides
  };
}

describe('DefaultAuthService', () => {
  let adapter: IAuthDataProvider;
  let service: DefaultAuthService;

  beforeEach(() => {
    adapter = createAdapter();
    const storage: AuthStorage = {
      setItem: vi.fn(),
      getItem: vi.fn(),
      removeItem: vi.fn()
    };
    service = new DefaultAuthService(adapter, storage);
    Object.defineProperty(global, 'localStorage', {
      value: { setItem: vi.fn(), getItem: vi.fn(), removeItem: vi.fn() },
      writable: true
    });
  });

  it('login success sets user and token', async () => {
    const payload: LoginPayload = { email: 'a@test.com', password: 'pw' };
    const result: AuthResult = { success: true, user: { id: '1', email: payload.email }, token: 'tok' };
    (adapter.login as any).mockResolvedValue(result);

    const res = await service.login(payload);

    expect(adapter.login).toHaveBeenCalledWith(payload);
    expect(res).toEqual(result);
    expect(service.getCurrentUser()).toEqual(result.user);
  });

  it('login failure stores error', async () => {
    const payload: LoginPayload = { email: 'a@test.com', password: 'bad' };
    (adapter.login as any).mockResolvedValue({ success: false, error: 'fail' });

    const res = await service.login(payload);

    expect(res.success).toBe(false);
    expect(res.error).toBe('fail');
    expect(service.getCurrentUser()).toBeNull();
  });

  it('logout calls provider and clears state', async () => {
    (adapter.logout as any).mockResolvedValue(undefined);
    (service as any).user = { id: '1', email: 'a@test.com' };
    (service as any).token = 'tok';

    await service.logout();

    expect(adapter.logout).toHaveBeenCalled();
    expect(service.getCurrentUser()).toBeNull();
  });
});

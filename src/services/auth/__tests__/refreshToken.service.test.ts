import { describe, it, expect, vi } from 'vitest';
import { DefaultAuthService } from '@/src/services/auth/defaultAuth.service';
import type { AuthDataProvider } from '@/adapters/auth/interfaces';
import { InvalidRefreshTokenError, TokenRefreshError } from '@/core/common/errors';

function createProvider(): AuthDataProvider {
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
    invalidateSessions: vi.fn(),
    startWebAuthnRegistration: vi.fn(),
    verifyWebAuthnRegistration: vi.fn(),
    handleSessionTimeout: vi.fn(),
  } as unknown as AuthDataProvider;
}

const tokenResult = {
  accessToken: 'a',
  refreshToken: 'b',
  expiresAt: Date.now() + 1000,
};

describe('DefaultAuthService.refreshToken', () => {
  it('retries once on transient failure', async () => {
    const provider = createProvider();
    (provider.refreshToken as any)
      .mockRejectedValueOnce(new TokenRefreshError('net'))
      .mockResolvedValueOnce(tokenResult);
    const service = new DefaultAuthService(provider);

    const result = await service.refreshToken();

    expect(result).toBe(true);
    expect((provider.refreshToken as any).mock.calls.length).toBe(2);
  });

  it('invalidates sessions on invalid token', async () => {
    const provider = createProvider();
    (provider.refreshToken as any).mockRejectedValue(new InvalidRefreshTokenError('bad'));
    const service = new DefaultAuthService(provider);
    (service as any).user = { id: '1', email: 't' };
    const handler = vi.fn();
    service.onType('auth_state_recovery_failed', handler);

    const result = await service.refreshToken();

    expect(result).toBe(false);
    expect(provider.invalidateSessions).toHaveBeenCalledWith('1');
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'invalid_refresh' })
    );
  });
});

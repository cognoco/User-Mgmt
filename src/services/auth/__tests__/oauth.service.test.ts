import { describe, it, expect, vi } from 'vitest';
import { DefaultAuthService } from '@/src/services/auth/defaultAuth.service';
import type { OAuthDataProvider } from '@/adapters/auth/providers/oauthProvider';
import { OAuthProvider } from '@/types/oauth';

function createProvider(): OAuthDataProvider {
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
    handleSessionTimeout: vi.fn(),
    configureProvider: vi.fn(),
    getProviderConfig: vi.fn(),
    getAuthorizationUrl: vi.fn().mockReturnValue('http://auth'),
    exchangeCode: vi.fn().mockResolvedValue({ accessToken: 'tok' }),
    fetchUserProfile: vi.fn().mockResolvedValue({
      id: '1',
      provider: OAuthProvider.GOOGLE,
      accessToken: 'tok',
    }),
    setProviderMetadata: vi.fn(),
    getProviderMetadata: vi.fn(),
  } as unknown as OAuthDataProvider;
}

describe('DefaultAuthService OAuth support', () => {
  it('builds authorization url via provider', () => {
    const provider = createProvider();
    const service = new DefaultAuthService(provider as any);
    const url = service.getOAuthAuthorizationUrl(OAuthProvider.GOOGLE, 's1');
    expect(provider.getAuthorizationUrl).toHaveBeenCalledWith(OAuthProvider.GOOGLE, 's1');
    expect(url).toBe('http://auth');
  });

  it('exchanges code and fetches profile', async () => {
    const provider = createProvider();
    const service = new DefaultAuthService(provider as any);
    const profile = await service.exchangeOAuthCode(OAuthProvider.GOOGLE, 'code');
    expect(provider.exchangeCode).toHaveBeenCalledWith(OAuthProvider.GOOGLE, 'code');
    expect(provider.fetchUserProfile).toHaveBeenCalledWith(OAuthProvider.GOOGLE, 'tok');
    expect(provider.setProviderMetadata).toHaveBeenCalledWith(OAuthProvider.GOOGLE, { accessToken: 'tok' });
    expect(profile).toEqual({ id: '1', provider: OAuthProvider.GOOGLE, accessToken: 'tok' });
  });

  it('throws error when exchange fails', async () => {
    const provider = createProvider();
    (provider.exchangeCode as any).mockRejectedValue(new Error('boom'));
    const service = new DefaultAuthService(provider as any);
    await expect(service.exchangeOAuthCode(OAuthProvider.GOOGLE, 'x')).rejects.toThrow('boom');
  });
});

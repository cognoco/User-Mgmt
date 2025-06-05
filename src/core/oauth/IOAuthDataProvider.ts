import { OAuthProvider } from '@/types/oauth';

export interface IOAuthDataProvider {
  /** Build an authorization URL for the given provider */
  getAuthorizationUrl(provider: OAuthProvider, state?: string): Promise<string> | string;

  /** Exchange an authorization code for provider tokens */
  exchangeCode(
    provider: OAuthProvider,
    code: string,
  ): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: number }>;

  /** Link an OAuth provider to the currently authenticated user */
  linkProvider(
    provider: OAuthProvider,
    code: string,
  ): Promise<{
    success: boolean;
    error?: string;
    status?: number;
    user?: any;
    linkedProviders?: string[];
    collision?: boolean;
  }>;

  /** Disconnect a previously linked provider from the current user */
  disconnectProvider(
    provider: OAuthProvider,
  ): Promise<{ success: boolean; error?: string; status?: number }>;

  /**
   * Verify that the given email address belongs to the currently authenticated user for the provider
   */
  verifyProviderEmail(
    providerId: OAuthProvider,
    email: string,
  ): Promise<{ success: boolean; error?: string; status?: number }>;
}

export type OAuthDataProvider = IOAuthDataProvider;

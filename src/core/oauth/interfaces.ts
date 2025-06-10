import { OAuthProvider } from "@/types/oauth";

export interface OAuthCallbackResult {
  user: any;
  token?: string;
  isNewUser: boolean;
  info: string;
}

export interface OAuthService {
  handleCallback(
    provider: OAuthProvider,
    code: string,
    state?: string,
  ): Promise<OAuthCallbackResult>;

  /**
   * Link an additional OAuth provider to the currently authenticated user.
   */
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

  disconnectProvider(
    provider: OAuthProvider,
  ): Promise<{ success: boolean; error?: string; status?: number }>;

  verifyProviderEmail(
    providerId: OAuthProvider,
    email: string,
  ): Promise<{ success: boolean; error?: string; status?: number }>;
}

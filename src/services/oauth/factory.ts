import type { OAuthService } from "@/core/oauth/interfaces";

export interface ApiOAuthServiceOptions {
  reset?: boolean;
}

// Client-side stub that throws for any method call
const clientStub: OAuthService = {
  handleCallback: () => Promise.reject(new Error('OAuth service only available on server')),
  linkProvider: () => Promise.reject(new Error('OAuth service only available on server')),
  disconnectProvider: () => Promise.reject(new Error('OAuth service only available on server')),
  verifyProviderEmail: () => Promise.reject(new Error('OAuth service only available on server')),
};

export function getApiOAuthService(): OAuthService {
  // Always return client stub to avoid importing server-only code
  // Server-side code should use getServerOAuthService from ./server
  return clientStub;
}

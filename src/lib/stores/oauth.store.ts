import { create } from 'zustand';
import { OAuthProvider, OAuthState } from '@/types/oauth';
import { useUserManagement } from '@/src/lib/auth/UserManagementProvider';
import { api } from '@/lib/api/axios';
import { useAuth } from '@/lib/hooks/useAuth';

type OAuthInternalState = Omit<OAuthState, 'login' | 'handleCallback'> & {
  login: (provider: OAuthProvider, oauth: any) => void;
  handleCallback: (
    provider: OAuthProvider,
    code: string,
    auth: ReturnType<typeof useAuth>,
    oauth: any
  ) => Promise<void>;
};

const oauthStoreBase = create<OAuthInternalState>((set, get) => ({
  isLoading: false,
  error: null,
  connectedProviders: [],

  /**
   * Initiate OAuth login flow
   */
  login: async (provider: OAuthProvider, _oauthConfig: any) => {
    try {
      set({ isLoading: true, error: null });
      const res = await api.post('/auth/oauth', { provider });
      if (!res.data.url) throw new Error('No authorization URL returned');
      window.location.href = res.data.url;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.response?.data?.message || (error instanceof Error ? error.message : 'Failed to initiate OAuth login'),
        isLoading: false,
      });
    }
  },

  /**
   * Handle OAuth callback
   */
  handleCallback: async (
    provider: OAuthProvider,
    code: string,
    authStore: ReturnType<typeof useAuth>,
    oauthConfig: any
  ) => {
    try {
      set({ isLoading: true, error: null });
      
      const urlParams = new URLSearchParams(window.location.search);
      const returnedState = urlParams.get('state');

      // Exchange code for tokens
      const response = await api.post('/auth/oauth/callback', {
        provider,
        code,
        redirectUri: window.location.origin + '/auth/callback',
        state: returnedState ?? undefined,
      });
      
      // Get auth store and update user
      if (response.data.user) {
        // User logged in or account linked
        authStore.setUser(response.data.user);
        authStore.setToken(response.data.token);
        
        // Update connected providers
        set(state => ({
          connectedProviders: [...state.connectedProviders, provider],
          isLoading: false,
        }));
        
        // Redirect to home or specified redirect path
        window.location.href = oauthConfig?.defaultRedirectPath || '/';
      } else {
        // Something went wrong
        throw new Error('Failed to authenticate with provider');
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.response?.data?.message || (error instanceof Error ? error.message : 'Failed to complete OAuth authentication'),
        isLoading: false,
      });
    }
  },

  /**
   * Disconnect an OAuth provider
   */
  disconnect: async (provider: OAuthProvider) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.post('/auth/oauth/disconnect', { provider });
      
      // Update connected providers
      set(state => ({
        connectedProviders: state.connectedProviders.filter(p => p !== provider),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.response?.data?.message || (error instanceof Error ? error.message : 'Failed to disconnect provider'),
        isLoading: false,
      });
    }
  },

  /**
   * Check if a provider is connected
   */
  isConnected: (provider: OAuthProvider) => {
    return get().connectedProviders.includes(provider);
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));

export function useOAuthStore() {
  const store = oauthStoreBase();
  const { oauth } = useUserManagement();
  const auth = useAuth();

  return {
    ...store,
    login: (provider: OAuthProvider) => store.login(provider, oauth),
    handleCallback: (provider: OAuthProvider, code: string) =>
      store.handleCallback(provider, code, auth, oauth),
  };
}

/**
 * Get default authorization URL for common providers
 */
function getDefaultAuthUrl(provider: OAuthProvider): string {
  switch (provider) {
    case OAuthProvider.GOOGLE:
      return 'https://accounts.google.com/o/oauth2/v2/auth';
    case OAuthProvider.GITHUB:
      return 'https://github.com/login/oauth/authorize';
    case OAuthProvider.FACEBOOK:
      return 'https://www.facebook.com/v12.0/dialog/oauth';
    case OAuthProvider.TWITTER:
      return 'https://twitter.com/i/oauth2/authorize';
    case OAuthProvider.MICROSOFT:
      return 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
    case OAuthProvider.APPLE:
      return 'https://appleid.apple.com/auth/authorize';
    case OAuthProvider.LINKEDIN:
      return 'https://www.linkedin.com/oauth/v2/authorization';
    default:
      throw new Error(`No default authorization URL for provider ${provider}`);
  }
} 
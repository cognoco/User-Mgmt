import { vi, Mock } from 'vitest';
import { AuthState, User } from '@/core/auth/models';

// Type for mocked auth store
export type MockAuthStore = {
  [K in keyof AuthState]: AuthState[K] extends (...args: infer Args) => infer Return
    ? Mock<Args, Return>
    : AuthState[K];
};

// Helper type for creating mock store state
export interface MockAuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
  isLoading: boolean;
}

// Type for API response mocks
export interface MockAuthResponse {
  data: {
    user: User;
    token: string;
  };
}

// Helper function to create a typed mock auth store
export const createMockAuthStore = (): MockAuthStore => ({
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
  isLoading: false,
  login: vi.fn<[import('@/types/auth').LoginPayload], Promise<import('@/types/auth').AuthResult>>(),
  register: vi.fn<[import('@/types/auth').RegistrationPayload], Promise<import('@/types/auth').AuthResult>>(),
  logout: vi.fn<[], Promise<void>>(),
  resetPassword: vi.fn<[string], Promise<{ success: boolean; message?: string; error?: string }>>(),
  updatePassword: vi.fn<[string, string], Promise<void>>(),
  sendVerificationEmail: vi.fn<[string], Promise<import('@/types/auth').AuthResult>>(),
  verifyEmail: vi.fn<[string], Promise<void>>(),
  clearError: vi.fn<[], void>(),
  successMessage: null,
  rateLimitInfo: null,
  mfaEnabled: false,
  mfaSecret: null,
  mfaQrCode: null,
  mfaBackupCodes: null,
  clearSuccessMessage: vi.fn<[], void>(),
  deleteAccount: vi.fn<
    [string | { userId: string; password: string }?],
    Promise<{ success: boolean; error?: string }>
  >(),
  setUser: vi.fn<[import('@/types/auth').User | null], void>(),
  setToken: vi.fn<[string | null], void>(),
  setupMFA: vi.fn<[], Promise<import('@/types/auth').MFASetupResponse>>(),
  verifyMFA: vi.fn<[string], Promise<import('@/types/auth').MFAVerifyResponse>>(),
  disableMFA: vi.fn<[string], Promise<import('@/types/auth').AuthResult>>(),
  handleSessionTimeout: vi.fn<[], void>(),
  refreshToken: vi.fn<[], Promise<boolean>>(),
  setLoading: vi.fn<[boolean], void>(),
});

// Shared mock generator for SAML config
export function createMockSamlConfig(overrides = {}) {
  return {
    type: 'saml',
    entity_id: 'https://test.idp.com',
    sign_in_url: 'https://test.idp.com/login',
    sign_out_url: 'https://test.idp.com/logout',
    certificate: '-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----',
    attribute_mapping: {
      email: 'email',
      name: 'name',
      role: 'role',
    },
    ...overrides,
  };
}

// Shared mock generator for OIDC config
export function createMockOidcConfig(overrides = {}) {
  return {
    type: 'oidc',
    client_id: 'client123',
    client_secret: 'secret123',
    discovery_url: 'https://test.idp.com/.well-known/openid-configuration',
    scopes: 'openid email profile',
    attribute_mapping: {
      email: 'email',
      name: 'name',
      role: 'role',
    },
    ...overrides,
  };
} 
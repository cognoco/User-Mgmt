import { vi, Mock } from 'vitest';
import { AuthState, User } from '../../types/auth';

// Type for mocked auth store
export type MockAuthStore = {
  [K in keyof AuthState]: AuthState[K] extends (...args: infer Args) => infer Return
    ? Mock<Args, Return>
    : AuthState[K];
};

// Helper type for creating mock store state
export type MockAuthState = {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
  isLoading: boolean;
};

// Type for API response mocks
export type MockAuthResponse = {
  data: {
    user: User;
    token: string;
  };
};

// Helper function to create a typed mock auth store
export const createMockAuthStore = (): MockAuthStore => ({
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
  isLoading: false,
  login: vi.fn<[import('../../types/auth').LoginPayload], Promise<import('../../types/auth').AuthResult>>(),
  register: vi.fn<[import('../../types/auth').RegistrationPayload], Promise<import('../../types/auth').AuthResult>>(),
  logout: vi.fn<[], Promise<void>>(),
  resetPassword: vi.fn<[string], Promise<{ success: boolean; message?: string; error?: string }>>(),
  updatePassword: vi.fn<[string, string], Promise<void>>(),
  sendVerificationEmail: vi.fn<[string], Promise<import('../../types/auth').AuthResult>>(),
  verifyEmail: vi.fn<[string], Promise<void>>(),
  clearError: vi.fn<[], void>(),
  successMessage: null,
  rateLimitInfo: null,
  mfaEnabled: false,
  mfaSecret: null,
  mfaQrCode: null,
  mfaBackupCodes: null,
  clearSuccessMessage: vi.fn<[], void>(),
  deleteAccount: vi.fn<[string?], Promise<void>>(),
  setUser: vi.fn<[import('../../types/auth').User | null], void>(),
  setToken: vi.fn<[string | null], void>(),
  setupMFA: vi.fn<[], Promise<import('../../types/auth').MFASetupResponse>>(),
  verifyMFA: vi.fn<[string], Promise<import('../../types/auth').MFAVerifyResponse>>(),
  disableMFA: vi.fn<[string], Promise<import('../../types/auth').AuthResult>>(),
  handleSessionTimeout: vi.fn<[], void>(),
  refreshToken: vi.fn<[], Promise<boolean>>(),
  setLoading: vi.fn<[boolean], void>(),
}); 
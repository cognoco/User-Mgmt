export {
  User,
  LoginPayload,
  RegistrationPayload,
  AuthResult,
  RateLimitInfo,
  MFASetupResponse,
  MFAVerifyResponse,
  PasswordResetToken,
  emailSchema,
  passwordSchema,
  loginSchema,
  registerSchema,
  type LoginData,
  type RegisterData,
} from '@/core/auth/models';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  successMessage: string | null;
  rateLimitInfo: RateLimitInfo | null;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  mfaQrCode: string | null;
  mfaBackupCodes: string[] | null;
  login: (data: LoginPayload) => Promise<AuthResult>;
  register: (data: RegistrationPayload) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: (email: string) => Promise<AuthResult>;
  verifyEmail: (token: string) => Promise<void>;
  clearError: () => void;
  clearSuccessMessage: () => void;
  deleteAccount: (password?: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setupMFA: () => Promise<MFASetupResponse>;
  verifyMFA: (code: string) => Promise<MFAVerifyResponse>;
  disableMFA: (code: string) => Promise<AuthResult>;
  handleSessionTimeout: () => void;
  refreshToken: () => Promise<boolean>;
  setLoading: (isLoading: boolean) => void;
}


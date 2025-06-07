// src/services/auth/__tests__/mocks/mock-auth-service.ts
import { vi } from 'vitest';
import { AuthService, AuthState } from '@/core/auth/interfaces';
import { 
  AuthResult, 
  LoginPayload, 
  MFASetupResponse, 
  MFAVerifyResponse, 
  RegistrationPayload, 
  User 
} from '@/core/auth/models';

/**
 * Mock implementation of the AuthService interface for testing
 */
export class MockAuthService implements AuthService {
  private authStateListeners: ((user: User | null) => void)[] = [];
  private mockUser: User | null = null;
  private mockAuthState: AuthState = {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    successMessage: null,
    mfaEnabled: false
  };
  private expiry: number | null = null;

  // Mock implementations with Vitest spies
  login = vi.fn().mockImplementation(async (credentials: LoginPayload): Promise<AuthResult> => {
    const result: AuthResult = { success: true };
    this.mockUser = { 
      id: 'mock-user-id', 
      email: credentials.email,
      name: 'Mock User',
      emailVerified: true
    };
    this.mockAuthState = {
      ...this.mockAuthState,
      user: this.mockUser,
      isAuthenticated: true,
      token: 'mock-token'
    };
    this.notifyListeners(this.mockUser);
    return result;
  });

  register = vi.fn().mockImplementation(async (userData: RegistrationPayload): Promise<AuthResult> => {
    const result: AuthResult = { success: true };
    this.mockUser = { 
      id: 'mock-user-id', 
      email: userData.email,
      name: userData.name || 'New User',
      emailVerified: false
    };
    this.mockAuthState = {
      ...this.mockAuthState,
      user: this.mockUser,
      isAuthenticated: true,
      token: 'mock-token'
    };
    this.notifyListeners(this.mockUser);
    return result;
  });

  logout = vi.fn().mockImplementation(async (): Promise<void> => {
    this.mockUser = null;
    this.mockAuthState = {
      ...this.mockAuthState,
      user: null,
      isAuthenticated: false,
      token: null
    };
    this.notifyListeners(null);
  });

  getCurrentUser = vi.fn().mockImplementation(async (): Promise<User | null> => {
    return this.mockUser;
  });

  isAuthenticated = vi.fn().mockImplementation((): boolean => {
    return this.mockAuthState.isAuthenticated;
  });

  resetPassword = vi.fn().mockImplementation(async (_email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    return { success: true, message: 'Password reset email sent' };
  });

  updatePassword = vi.fn().mockImplementation(async (_oldPassword: string, _newPassword: string): Promise<void> => {
    // Implementation not needed for most tests
  });

  sendVerificationEmail = vi.fn().mockImplementation(async (_email: string): Promise<AuthResult> => {
    return { success: true };
  });

  verifyEmail = vi.fn().mockImplementation(async (_token: string): Promise<void> => {
    if (this.mockUser) {
      this.mockUser.emailVerified = true;
      this.notifyListeners(this.mockUser);
    }
  });

  deleteAccount = vi.fn().mockImplementation(async (_password?: string): Promise<void> => {
    this.mockUser = null;
    this.mockAuthState = {
      ...this.mockAuthState,
      user: null,
      isAuthenticated: false,
      token: null
    };
    this.notifyListeners(null);
  });

  setupMFA = vi.fn().mockImplementation(async (): Promise<MFASetupResponse> => {
    return { 
      secret: 'mock-mfa-secret', 
      qrCode: 'data:image/png;base64,mockQrCodeData' 
    };
  });

  verifyMFA = vi.fn().mockImplementation(async (_code: string): Promise<MFAVerifyResponse> => {
    this.mockAuthState = {
      ...this.mockAuthState,
      mfaEnabled: true
    };
    return { success: true, token: 'mock-mfa-token' };
  });

  disableMFA = vi.fn().mockImplementation(async (_code: string): Promise<AuthResult> => {
    this.mockAuthState = {
      ...this.mockAuthState,
      mfaEnabled: false
    };
    return { success: true };
  });

  refreshToken = vi.fn().mockImplementation(
    async (): Promise<{
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    } | null> => {
      const result = {
        accessToken: 'mock-access',
        refreshToken: 'mock-refresh',
        expiresAt: Date.now() + 60_000,
      };
      this.expiry = result.expiresAt;
      return result;
    },
  );

  getTokenExpiry = vi.fn().mockImplementation(() => this.expiry);

  handleSessionTimeout = vi.fn().mockImplementation((): void => {
    this.logout();
  });

  onAuthStateChanged = vi.fn().mockImplementation((callback: (user: User | null) => void): (() => void) => {
    this.authStateListeners.push(callback);
    // Call immediately with current state
    callback(this.mockUser);
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index !== -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  });

  // Helper methods for testing
  private notifyListeners(user: User | null): void {
    this.authStateListeners.forEach(listener => listener(user));
  }

  // Methods to control mock behavior in tests
  setMockUser(user: User | null): void {
    this.mockUser = user;
    this.mockAuthState = {
      ...this.mockAuthState,
      user,
      isAuthenticated: !!user,
      token: user ? 'mock-token' : null
    };
    this.notifyListeners(user);
  }

  setMockAuthState(state: Partial<AuthState>): void {
    this.mockAuthState = {
      ...this.mockAuthState,
      ...state
    };
    this.notifyListeners(this.mockAuthState.user);
  }

  getMockAuthState(): AuthState {
    return this.mockAuthState;
  }
}
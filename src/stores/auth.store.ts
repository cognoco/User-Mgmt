import { create } from 'zustand';
import { api } from '@/lib/api/axios';
import type { 
  User, 
  AuthResult, 
  RegistrationPayload,
  MFASetupResponse,
  MFAVerifyResponse
} from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  mfaQrCode: string | null;
  mfaBackupCodes: string[] | null;

  // Auth methods
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
  register: (data: RegistrationPayload) => Promise<AuthResult>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  
  // MFA methods
  setupMFA: () => Promise<MFASetupResponse>;
  verifyMFA: (code: string, isBackupCode?: boolean) => Promise<MFAVerifyResponse>;
  disableMFA: () => Promise<AuthResult>;
  
  // State management
  clearError: () => void;
  clearSuccess: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  success: null,
  mfaEnabled: false,
  mfaSecret: null,
  mfaQrCode: null,
  mfaBackupCodes: null,

  login: async (email: string, password: string, rememberMe = false): Promise<AuthResult> => {
    try {
      set({ loading: true, error: null });
      const response = await api.post<{ user: User; token: string; requiresMfa?: boolean }>('/api/auth/login', { 
        email, 
        password,
        rememberMe 
      });
      
      set({ 
        token: response.data.token,
        user: response.data.user,
        mfaEnabled: response.data.user.mfaEnabled || false
      });

      return {
        success: true,
        requiresMfa: response.data.requiresMfa,
        token: response.data.token
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({ error: errorMessage });
      return {
        success: false,
        error: errorMessage,
        code: error.response?.data?.code
      };
    } finally {
      set({ loading: false });
    }
  },

  register: async (data: RegistrationPayload): Promise<AuthResult> => {
    try {
      set({ loading: true, error: null });
      const response = await api.post<{ user: User; token: string }>('/api/auth/register', data);
      set({ 
        token: response.data.token,
        user: response.data.user,
        success: 'Registration successful'
      });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({ error: errorMessage });
      return {
        success: false,
        error: errorMessage,
        code: error.response?.data?.code
      };
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      mfaEnabled: false,
      mfaSecret: null,
      mfaQrCode: null,
      mfaBackupCodes: null
    });
    localStorage.removeItem('auth_token');
  },

  resetPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });
      await api.post('/api/auth/reset-password', { email });
      set({ success: 'Password reset email sent' });
      return { success: true, message: 'Password reset email sent' };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ loading: false });
    }
  },

  updatePassword: async (oldPassword: string, newPassword: string) => {
    try {
      set({ loading: true, error: null });
      await api.post('/api/auth/update-password', { oldPassword, newPassword });
      set({ success: 'Password updated successfully' });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password update failed';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ loading: false });
    }
  },

  setupMFA: async (): Promise<MFASetupResponse> => {
    try {
      set({ loading: true, error: null });
      const response = await api.post<MFASetupResponse>('/api/auth/2fa/setup');
      set({ 
        mfaSecret: response.data.secret || null,
        mfaQrCode: response.data.qrCode || null,
        mfaBackupCodes: response.data.backupCodes || null
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'MFA setup failed';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ loading: false });
    }
  },

  verifyMFA: async (code: string, isBackupCode = false): Promise<MFAVerifyResponse> => {
    try {
      set({ loading: true, error: null });
      const response = await api.post<MFAVerifyResponse>('/api/auth/2fa/verify', { 
        code,
        isBackupCode
      });
      set({ 
        mfaEnabled: true,
        success: 'MFA verification successful',
        token: response.data.token // Update token after MFA verification
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'MFA verification failed';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ loading: false });
    }
  },

  disableMFA: async (): Promise<AuthResult> => {
    try {
      set({ loading: true, error: null });
      await api.post('/api/auth/2fa/disable');
      set({ 
        mfaEnabled: false,
        mfaSecret: null,
        mfaQrCode: null,
        mfaBackupCodes: null,
        success: 'MFA disabled successfully'
      });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to disable MFA';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: null }),
  setUser: (user: User | null) => set({ user }),
  setToken: (token: string) => set({ token })
})); 
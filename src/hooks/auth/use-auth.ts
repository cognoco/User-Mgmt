import { useState, useEffect, useCallback } from 'react';
import type {
  User,
  LoginPayload,
  RegistrationPayload,
  AuthResult,
  MFASetupResponse,
  MFAVerifyResponse
} from '@/core/auth/models';
import { useAuthService } from '@/lib/context/AuthContext';

export interface UseAuth {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  mfaQrCode: string | null;
  mfaBackupCodes: string[] | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
  register: (data: RegistrationPayload) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  setupMFA: () => Promise<MFASetupResponse>;
  verifyMFA: (code: string, isBackupCode?: boolean) => Promise<MFAVerifyResponse>;
  disableMFA: () => Promise<AuthResult>;
  clearError: () => void;
  clearSuccess: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export function useAuth(): UseAuth {
  const authService = useAuthService();

  const [user, setUserState] = useState<User | null>(authService.getCurrentUser());
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null);
  const [mfaBackupCodes, setMfaBackupCodes] = useState<string[] | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(updatedUser => {
      setUserState(updatedUser);
    });
    return unsubscribe;
  }, [authService]);

  const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login({ email, password, rememberMe });
      setLoading(false);
      if (result.success) {
        if (result.user) {
          setUserState(result.user);
          setMfaEnabled(!!result.user.mfaEnabled);
        }
        if (result.token) {
          setTokenState(result.token);
        }
        setSuccess('Login successful');
      } else if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setLoading(false);
      setError(message);
      return { success: false, error: message };
    }
  }, [authService]);

  const register = useCallback(async (data: RegistrationPayload): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.register(data);
      setLoading(false);
      if (result.success) {
        if (result.user) {
          setUserState(result.user);
          setMfaEnabled(!!result.user.mfaEnabled);
        }
        if (result.token) {
          setTokenState(result.token);
        }
        setSuccess('Registration successful');
      } else if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setLoading(false);
      setError(message);
      return { success: false, error: message };
    }
  }, [authService]);

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
      setLoading(false);
      setUserState(null);
      setTokenState(null);
      setMfaEnabled(false);
      setSuccess('Logout successful');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setLoading(false);
      setError(message);
    }
  }, [authService]);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.resetPassword(email);
      setLoading(false);
      if (result.success) {
        setSuccess(result.message || 'Password reset email sent');
      } else if (result.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setLoading(false);
      setError(message);
      return { success: false, error: message };
    }
  }, [authService]);

  const updatePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.updatePassword(oldPassword, newPassword);
      setLoading(false);
      setSuccess('Password updated successfully');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password update failed';
      setLoading(false);
      setError(message);
      return { success: false, error: message };
    }
  }, [authService]);

  const setupMFA = useCallback(async (): Promise<MFASetupResponse> => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.setupMFA();
      setLoading(false);
      if (res.success) {
        setMfaSecret(res.secret || null);
        setMfaQrCode(res.qrCode || null);
        setMfaBackupCodes(res.backupCodes || null);
        setSuccess('MFA setup successful');
      } else if (res.error) {
        setError(res.error);
      }
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'MFA setup failed';
      setLoading(false);
      setError(message);
      return { success: false, error: message };
    }
  }, [authService]);

  const verifyMFA = useCallback(async (code: string): Promise<MFAVerifyResponse> => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.verifyMFA(code);
      setLoading(false);
      if (res.success) {
        setMfaEnabled(true);
        setMfaBackupCodes(res.backupCodes || null);
        setTokenState(res.token || null);
        setSuccess('MFA verification successful');
      } else if (res.error) {
        setError(res.error);
      }
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'MFA verification failed';
      setLoading(false);
      setError(message);
      return { success: false, error: message };
    }
  }, [authService]);

  const disableMFA = useCallback(async (): Promise<AuthResult> => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.disableMFA('');
      setLoading(false);
      if (res.success) {
        setMfaEnabled(false);
        setMfaSecret(null);
        setMfaQrCode(null);
        setMfaBackupCodes(null);
        setSuccess('MFA disabled successfully');
      } else if (res.error) {
        setError(res.error);
      }
      return res;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable MFA';
      setLoading(false);
      setError(message);
      return { success: false, error: message };
    }
  }, [authService]);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);
  const setUser = useCallback((u: User | null) => setUserState(u), []);
  const setToken = useCallback((t: string | null) => setTokenState(t), []);

  return {
    user,
    token,
    loading,
    error,
    success,
    mfaEnabled,
    mfaSecret,
    mfaQrCode,
    mfaBackupCodes,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    setupMFA,
    verifyMFA,
    disableMFA,
    clearError,
    clearSuccess,
    setUser,
    setToken,
  };
}

export default useAuth;

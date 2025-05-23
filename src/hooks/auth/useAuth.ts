/**
 * Authentication Hook
 * 
 * This hook provides access to the authentication service and state.
 * It follows the architecture principles by connecting the UI layer to the service layer.
 */

import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/core/auth/interfaces';
import { User, LoginPayload, RegistrationPayload, AuthResult, MFASetupResponse, MFAVerifyResponse } from '@/core/auth/models';
import { UserManagementConfiguration } from '@/core/config';
import { useAuthService } from '@/lib/context/AuthContext';

/**
 * Interface for the useAuth hook return value
 */
export interface UseAuth {
  // User state
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  success: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  successMessage: string | null;
  
  // MFA state
  mfaEnabled: boolean;
  mfaSecret: string | null;
  mfaQrCode: string | null;
  mfaBackupCodes: string[] | null;
  
  // Authentication methods
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
  register: (data: RegistrationPayload) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  
  // MFA methods
  setupMFA: () => Promise<MFASetupResponse>;
  verifyMFA: (code: string, isBackupCode?: boolean) => Promise<MFAVerifyResponse>;
  disableMFA: () => Promise<AuthResult>;
  
  // State management
  clearError: () => void;
  clearSuccess: () => void;
  clearMessages: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  
  // Session management
  refreshToken: () => Promise<boolean>;
  updateLastActivity: () => void;
  onSessionTimeout: (callback: () => void) => (() => void);
  onAuthEvent: (callback: (event: any) => void) => (() => void);
  
  // Direct access to the service
  authService: AuthService;
}

/**
 * Hook for authentication functionality
 * 
 * @returns Authentication state and methods
 */
export function useAuth(): UseAuth {
  // Get the auth service from the service provider registry
  const authService = UserManagementConfiguration.getServiceProvider<AuthService>('authService') || useAuthService();
  
  if (!authService) {
    throw new Error('AuthService is not registered in the service provider registry');
  }
  
  // Local state for authentication
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [user, setUserState] = useState<User | null>(authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [token, setTokenState] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null);
  const [mfaBackupCodes, setMfaBackupCodes] = useState<string[] | null>(null);
  
  // Update state when auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((updatedUser) => {
      setUserState(updatedUser);
      setIsAuthenticated(!!updatedUser);
    });
    
    return () => {
      unsubscribe();
    };
  }, [authService]);
  
  // Login method
  const login = useCallback(async (email: string, password: string, rememberMe = false): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.login({ email, password, rememberMe });
      
      setIsLoading(false);
      
      if (result.success) {
        if (result.user) {
          setUserState(result.user);
          setIsAuthenticated(!!result.user);
          setMfaEnabled(!!result.user.mfaEnabled);
        }
        if (result.token) {
          setTokenState(result.token);
        }
        setSuccessMessage('Login successful');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [authService]);
  
  // Register method
  const register = useCallback(async (userData: RegistrationPayload): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.register(userData);
      
      setIsLoading(false);
      
      if (result.success) {
        if (result.user) {
          setUserState(result.user);
          setIsAuthenticated(!!result.user);
          setMfaEnabled(!!result.user.mfaEnabled);
        }
        if (result.token) {
          setTokenState(result.token);
        }
        setSuccessMessage('Registration successful');
      } else if (result.error) {
        setError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [authService]);
  
  // Logout method
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      
      setIsLoading(false);
      setUserState(null);
      setIsAuthenticated(false);
      setTokenState(null);
      setSuccessMessage('Logout successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      
      setIsLoading(false);
      setError(errorMessage);
    }
  }, [authService]);
  
  // Reset password method
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.resetPassword(email);
      
      setIsLoading(false);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.message) {
        setSuccessMessage(result.message);
      } else if (result.success) {
        setSuccessMessage('Password reset email sent');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [authService]);
  
  // Update password method
  const updatePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authService.updatePassword(oldPassword, newPassword);
      
      setIsLoading(false);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccessMessage('Password updated successfully');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password update failed';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [authService]);
  
  // MFA setup method
  const setupMFA = useCallback(async (): Promise<MFASetupResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await authService.setupMFA();
      
      setIsLoading(false);
      
      if (res.success) {
        setMfaSecret(res.secret || null);
        setMfaQrCode(res.qrCode || null);
        setMfaBackupCodes(res.backupCodes || null);
        setSuccessMessage('MFA setup successful');
      } else if (res.error) {
        setError(res.error);
      }
      
      return res;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'MFA setup failed';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [authService]);
  
  // MFA verification method
  const verifyMFA = useCallback(async (code: string, isBackupCode = false): Promise<MFAVerifyResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await authService.verifyMFA(code, isBackupCode);
      
      setIsLoading(false);
      
      if (res.success) {
        setMfaEnabled(true);
        setMfaBackupCodes(res.backupCodes || null);
        setTokenState(res.token || null);
        setSuccessMessage('MFA verification successful');
      } else if (res.error) {
        setError(res.error);
      }
      
      return res;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'MFA verification failed';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [authService]);
  
  // Disable MFA method
  const disableMFA = useCallback(async (): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await authService.disableMFA('');
      
      setIsLoading(false);
      
      if (res.success) {
        setMfaEnabled(false);
        setMfaSecret(null);
        setMfaQrCode(null);
        setMfaBackupCodes(null);
        setSuccessMessage('MFA disabled successfully');
      } else if (res.error) {
        setError(res.error);
      }
      
      return res;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disable MFA';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [authService]);
  
  // Session management methods
  const refreshToken = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await authService.refreshToken();
      
      setIsLoading(false);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      
      setIsLoading(false);
      setError(errorMessage);
      
      return false;
    }
  }, [authService]);
  
  const updateLastActivity = useCallback((): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_activity', Date.now().toString());
    }
  }, []);
  
  const onSessionTimeout = useCallback((callback: () => void): (() => void) => {
    return authService.onAuthEvent(event => {
      if (event.type === 'SESSION_TIMEOUT') {
        callback();
      }
    });
  }, [authService]);
  
  const onAuthEvent = useCallback((callback: (event: any) => void): (() => void) => {
    return authService.onAuthEvent(callback);
  }, [authService]);
  
  // Clear message methods
  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccessMessage(null), []);
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);
  
  // User and token setters
  const setUser = useCallback((u: User | null) => setUserState(u), []);
  const setToken = useCallback((t: string | null) => setTokenState(t), []);
  
  return {
    // State
    user,
    token,
    loading: isLoading,
    isLoading,
    error,
    success: successMessage,
    successMessage,
    isAuthenticated,
    mfaEnabled,
    mfaSecret,
    mfaQrCode,
    mfaBackupCodes,
    
    // Methods
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
    clearMessages,
    setUser,
    setToken,
    
    // Session management
    refreshToken,
    updateLastActivity,
    onSessionTimeout,
    onAuthEvent,
    
    // Direct access to the service for advanced operations
    authService
  };
}
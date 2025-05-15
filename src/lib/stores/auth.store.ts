import { create } from 'zustand';
import { api } from '@/lib/api/axios';
import { supabase } from '@/lib/database/supabase';
import { 
  AuthState, 
  LoginPayload, 
  RegistrationPayload, 
  User, 
  AuthResult,
  RateLimitInfo,
  MFASetupResponse,
  MFAVerifyResponse
} from '@/types/auth';

// Constants for token management
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const SESSION_CHECK_INTERVAL = 1 * 60 * 1000; // 1 minute in milliseconds

// Add a log to check if the import worked at module level
console.log('[AuthStore Module] Supabase instance imported:', typeof supabase !== 'undefined');

// Explicitly type the state creator function - Update for Zustand v5 and React 19
export const useAuthStore = create<AuthState>()((set, get) => {
  let sessionCheckTimer: NodeJS.Timeout | null = null;
  let tokenRefreshTimer: NodeJS.Timeout | null = null;

  // Initialize session check
  const initializeSessionCheck = () => {
    if (sessionCheckTimer) {
      clearInterval(sessionCheckTimer);
    }
    sessionCheckTimer = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem('last_activity') || '0', 10);
      const now = Date.now();
      
      if (now - lastActivity > SESSION_TIMEOUT) {
        get().handleSessionTimeout();
      }
    }, SESSION_CHECK_INTERVAL);
  };

  // Update last activity timestamp
  const updateLastActivity = () => {
    localStorage.setItem('last_activity', Date.now().toString());
  };

  // Initialize token refresh
  const initializeTokenRefresh = (expiresAt: number) => {
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
    }
    const now = Date.now();
    const timeUntilRefresh = expiresAt - now - TOKEN_REFRESH_THRESHOLD;
    
    if (timeUntilRefresh > 0) {
      tokenRefreshTimer = setTimeout(() => {
        get().refreshToken();
      }, timeUntilRefresh);
    } else {
      // Token is close to expiration or expired, refresh immediately
      get().refreshToken();
    }
  };

  // Clean up timers
  const cleanupTimers = () => {
    if (sessionCheckTimer) {
      clearInterval(sessionCheckTimer);
      sessionCheckTimer = null;
    }
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
      tokenRefreshTimer = null;
    }
  };

  return {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    successMessage: null,
    rateLimitInfo: null,
    mfaEnabled: false,
    mfaSecret: null,
    mfaQrCode: null,
    mfaBackupCodes: null,

    setLoading: (isLoading: boolean) => set({ isLoading }),

    handleSessionTimeout: () => {
      cleanupTimers();
      set({ 
        user: null, 
        token: null,
        isAuthenticated: false,
        error: 'Session expired. Please log in again.',
        successMessage: null,
        rateLimitInfo: null
      });
      localStorage.removeItem('auth_token');
      localStorage.removeItem('last_activity');
    },

    refreshToken: async () => {
      try {
        const response = await api.post('/api/auth/refresh');
        const { token, expiresAt } = response.data;
        
        set({ token });
        localStorage.setItem('auth_token', token);
        
        // Initialize next token refresh
        initializeTokenRefresh(expiresAt);
        
        return true;
      } catch (error) {
        // If refresh fails, log out the user
        get().handleSessionTimeout();
        return false;
      }
    },

    login: async (data: LoginPayload): Promise<AuthResult> => {
      set({ isLoading: true, error: null });
      console.log('[DEBUG AuthStore] login called with:', data);
      try {
        const response = await api.post('/api/auth/login', data);
        console.log('[DEBUG AuthStore] api.post response:', response);
        set({ 
          isLoading: false,
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          error: null,
          rateLimitInfo: null
        });

        // Initialize session management
        updateLastActivity();
        initializeSessionCheck();

        // Initialize token refresh if expiration is provided
        if (response.data.expiresAt) {
          initializeTokenRefresh(response.data.expiresAt);
        }

        return {
          success: true,
          requiresMfa: response.data.requiresMfa,
          token: response.data.token
        };
      } catch (error: any) {
        console.log('[DEBUG AuthStore] login caught error:', error);
        const errorMessage = error.response?.data?.error || 'An error occurred during login';
        const errorCode = error.response?.data?.code;
        
        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = parseInt(error.response.headers['retry-after'] || '900', 10) * 1000;
          const remainingAttempts = parseInt(error.response.headers['x-ratelimit-remaining'] || '0', 10);
          
          const rateLimitInfo: RateLimitInfo = {
            retryAfter,
            remainingAttempts,
            windowMs: 15 * 60 * 1000 // 15 minutes
          };
          
          set({
            isLoading: false,
            error: 'Too many login attempts. Please try again later.',
            rateLimitInfo
          });

          return {
            success: false,
            error: errorMessage,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter,
            remainingAttempts
          };
        }

        set({ 
          isLoading: false,
          error: errorMessage,
          isAuthenticated: false,
          user: null,
          token: null,
          rateLimitInfo: null
        });

        return {
          success: false,
          error: errorMessage,
          code: errorCode as AuthResult['code']
        };
      }
    },

    logout: async () => {
      try {
        await api.post('/api/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        cleanupTimers();
        set({ 
          user: null, 
          token: null,
          isAuthenticated: false,
          error: null,
          successMessage: null,
          rateLimitInfo: null
        });
        localStorage.removeItem('auth_token');
        localStorage.removeItem('last_activity');
      }
    },

    register: async (data: RegistrationPayload): Promise<AuthResult> => {
      set({ isLoading: true, error: null });

      // ---> ADDED LOGGING TO CHECK INSTANCE <--- 
      console.log('[AuthStore Register] Checking Supabase instance before use:', supabase);
      if (!supabase || typeof supabase.auth?.signUp !== 'function') {
        console.error('[AuthStore Register] CRITICAL: Supabase client or supabase.auth.signUp is not available!');
        set({ isLoading: false, error: 'Internal Registration Error: Supabase client failed.' });
        return { success: false, error: 'Internal registration error.' };
      }
      // --- END ADDED LOGGING ---

      try {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
            },
            emailRedirectTo: process.env.NEXT_PUBLIC_VERIFICATION_REDIRECT_URL, 
          },
        });

        if (signUpError) {
            console.error('[AuthStore Register Error]', signUpError);
            // Add debug log for the exact error message
            console.error('[DEBUG] Supabase signUpError.message:', signUpError.message);
            const errorMessage = signUpError.message || 'Registration failed';
            if (signUpError.status === 429) {
                set({ isLoading: false, error: 'Too many registration attempts. Please try again later.', rateLimitInfo: { windowMs: 60000} });
                return { success: false, error: errorMessage, code: 'RATE_LIMIT_EXCEEDED' };
            }
            if (
                /already registered|already exists|email in use|account exists|already been registered/i.test(signUpError.message)
            ) {
                set({ 
                    isLoading: false, 
                    error: 'This user already exists - please use the log in (with link to log in front page)',
                    successMessage: null
                });
                return { success: false, error: 'This user already exists - please use the log in (with link to log in front page)' };
            }

            set({ isLoading: false, error: errorMessage });
            return { success: false, error: errorMessage };
        }

        if (signUpData.user && signUpData.user.email_confirmed_at) {
            console.error('[DEBUG] Already registered/verified user path hit in register:', signUpData.user);
            set({ isLoading: false, error: 'Email already exists and is verified. Try logging in.', successMessage: null });
            return { success: false, error: 'Email already exists and is verified. Try logging in.' };
        }

        if (signUpData.user && !signUpData.user.email_confirmed_at) {
            set({ 
                isLoading: false, 
                error: null, 
                successMessage: 'Registration successful! Please check your email to verify your account.' 
            });
            return { success: true };
        } else if (signUpData.user) {
             console.warn('Registration successful, but user is already confirmed.');
             set({ 
                isLoading: false, 
                error: null, 
                successMessage: 'Account exists and is verified. Try logging in.' 
            });
            return { success: true };
        } else {
            console.error('Registration completed without user data or error.');
             set({ isLoading: false, error: 'An unexpected issue occurred during registration.' });
            return { success: false, error: 'An unexpected issue occurred.' };
        }

      } catch (error: any) {
        console.error('[AuthStore Register Catch]', error);
        const errorMessage = error.message || 'An unexpected registration error occurred.';
        set({ isLoading: false, error: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    clearError: () => set({ error: null }),
    clearSuccessMessage: () => set({ successMessage: null }),
    setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
    setToken: (token: string | null) => set({ token }),

    setupMFA: async (): Promise<MFASetupResponse> => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.post('/api/auth/2fa/setup');
        const { secret, qrCode } = response.data;
        
        set({ 
          isLoading: false,
          error: null,
          mfaSecret: secret,
          mfaQrCode: qrCode
        });

        return {
          success: true,
          secret,
          qrCode
        };
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to setup MFA';
        
        set({ 
          isLoading: false,
          error: errorMessage,
          mfaSecret: null,
          mfaQrCode: null
        });

        return {
          success: false,
          error: errorMessage
        };
      }
    },

    verifyMFA: async (code: string): Promise<MFAVerifyResponse> => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await api.post('/api/auth/2fa/verify', { code });
        const { backupCodes } = response.data;
        
        set({ 
          isLoading: false,
          error: null,
          mfaEnabled: true,
          mfaBackupCodes: backupCodes,
          successMessage: 'MFA setup successful!'
        });

        if (response.data.user) {
          set({
            user: response.data.user
          });
        }

        return {
          success: true,
          backupCodes
        };
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to verify MFA code';
        
        set({ 
          isLoading: false,
          error: errorMessage
        });

        return {
          success: false,
          error: errorMessage
        };
      }
    },

    disableMFA: async (code: string): Promise<AuthResult> => {
      set({ isLoading: true, error: null });
      
      try {
        await api.post('/api/auth/2fa/disable', { code });
        
        set({ 
          isLoading: false,
          error: null,
          mfaEnabled: false,
          mfaSecret: null,
          mfaQrCode: null,
          mfaBackupCodes: null,
          successMessage: 'MFA disabled successfully'
        });

        return {
          success: true
        };
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to disable MFA';
        
        set({ 
          isLoading: false,
          error: errorMessage
        });

        return {
          success: false,
          error: errorMessage
        };
      }
    },

    sendVerificationEmail: async (email: string): Promise<AuthResult> => {
      set({ isLoading: true, error: null });
      
      try {
        await api.post('/auth/send-verification-email', { email });
        
        set({ 
          isLoading: false,
          error: null,
          successMessage: 'Verification email sent successfully.'
        });

        return {
          success: true,
        };
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to send verification email';
        
        // Handle rate limiting for email verification
        if (error.response?.status === 429) {
          const retryAfter = parseInt(error.response.headers['retry-after'] || '900', 10) * 1000;
          const remainingAttempts = parseInt(error.response.headers['x-ratelimit-remaining'] || '0', 10);
          
          const rateLimitInfo: RateLimitInfo = {
            retryAfter,
            remainingAttempts,
            windowMs: 15 * 60 * 1000
          };
          
          set({
            isLoading: false,
            error: 'Too many verification email requests. Please try again later.',
            rateLimitInfo
          });

          return {
            success: false,
            error: errorMessage,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter,
            remainingAttempts
          };
        }

        set({ 
          isLoading: false,
          error: errorMessage,
          rateLimitInfo: null
        });

        return {
          success: false,
          error: errorMessage
        };
      }
    },

    // --- Added Stubs for Missing Methods ---
    resetPassword: async (email: string): Promise<{ success: boolean; message?: string; error?: string }> => {
      set({ isLoading: true, error: null, successMessage: null });
      try {
        // Replace with actual API call
        await api.post('/api/auth/reset-password', { email });
        set({ isLoading: false, successMessage: 'Password reset email sent. Check your inbox.' });
        return { success: true, message: 'Password reset email sent.' };
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to send password reset email.';
        set({ isLoading: false, error: errorMessage });
        return { success: false, error: errorMessage };
      }
    },

    updatePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
      set({ isLoading: true, error: null, successMessage: null });
      try {
        await api.put('/api/auth/update-password', { oldPassword, newPassword });
        set({ isLoading: false, successMessage: 'Password updated successfully.' });
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to update password.';
        set({ isLoading: false, error: errorMessage });
        throw new Error(errorMessage); // Re-throw for component handling
      }
    },

    verifyEmail: async (token: string): Promise<void> => {
      set({ isLoading: true, error: null, successMessage: null });
      try {
        await api.post('/api/auth/verify-email', { token });
        set({ isLoading: false, successMessage: 'Email verified successfully!' });
        // Potentially refresh user state or token here
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Email verification failed.';
        set({ isLoading: false, error: errorMessage });
        throw new Error(errorMessage); // Re-throw for component handling
      }
    },

    deleteAccount: async (password?: string): Promise<void> => {
      set({ isLoading: true, error: null, successMessage: null });
      try {
        await api.delete('/api/auth/delete-account', { data: { password } }); // Send password in body if required
        set({ isLoading: false, successMessage: 'Account deleted successfully.', user: null, token: null, isAuthenticated: false });
        cleanupTimers();
        localStorage.removeItem('auth_token');
        localStorage.removeItem('last_activity');
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 'Failed to delete account.';
        set({ isLoading: false, error: errorMessage });
        throw new Error(errorMessage); // Re-throw for component handling
      }
    },
    // --- End of Added Stubs ---

  };
});

/**
 * Login Form Business Logic Hook
 * 
 * This hook provides business logic for login forms, including authentication,
 * error handling, navigation, and MFA flows. It's designed to work with the
 * headless LoginForm component by providing the onSubmit handler and related state.
 * 
 * ARCHITECTURE: This hook contains business logic and should be used by pages
 * or higher-level components that need login functionality. It provides the
 * onSubmit prop for the headless LoginForm component.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/auth/useAuth';
import { useLogin } from '@/src/hooks/auth/useLogin';
import { useSectionErrors, useErrorStore } from '@/lib/state/errorStore';
import type { LoginPayload } from '@/core/auth/models';

export interface UseLoginFormLogicReturn {
  // The main onSubmit handler for the headless component
  onSubmit: (credentials: LoginPayload) => Promise<void>;
  
  // MFA-related handlers
  handleResendVerification: (email: string) => Promise<void>;
  handleMfaSuccess: (user: any, token: string) => void;
  handleLoginSuccess: (data: any) => void;
  handleMfaCancel: () => void;
  handleRateLimitComplete: () => void;
  
  // State for additional UI elements (rate limiting, resend, etc.)
  resendStatus: { message: string; type: 'success' | 'error' } | null;
  showResendLink: boolean;
  rateLimitInfo: { retryAfter?: number; remainingAttempts?: number } | null;
  
  // MFA flow state
  mfaRequired: boolean;
  tempAccessToken: string | null;
  user: any;
  
  // Error and success state
  authErrors: ReturnType<typeof useSectionErrors>;
  authError: string | null;
  success: string | null;
  
  // Loading state
  isLoading: boolean;
}

export function useLoginFormLogic(): UseLoginFormLogicReturn {
  const router = useRouter();
  const { authService, user } = useAuth();
  const {
    login,
    resendVerificationEmail,
    error: authError,
    successMessage: success,
    mfaRequired,
    tempAccessToken,
    clearState,
    isLoading,
  } = useLogin();

  const [resendStatus, setResendStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResendLink, setShowResendLink] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ retryAfter?: number; remainingAttempts?: number } | null>(null);
  const authErrors = useSectionErrors('auth');
  const addError = useErrorStore(state => state.addError);
  const clearAuthErrors = useErrorStore(state => state.clearErrors);

  // Main business logic handler for login form submission
  const onSubmit = async (credentials: LoginPayload): Promise<void> => {
    // Reset all error states
    clearAuthErrors('auth');
    setResendStatus(null);
    setShowResendLink(false);
    clearState();
    setRateLimitInfo(null);

    try {
      const result = await login(credentials);

      if (result.success) {
        // If MFA is not required, redirect to dashboard
        if (!result.requiresMfa) {
          router.push('/dashboard/overview');
        }
        // If MFA is required, the state is handled by the useLogin hook
      } else {
        // Handle authentication errors
        addError({
          message: result.error || 'Login failed',
          type: result.code,
          section: 'auth',
          dismissAfter: 8000,
          sync: true,
        });
        
        // Handle specific error cases
        if (result.code === 'EMAIL_NOT_VERIFIED') {
          setShowResendLink(true);
        } else if (result.code === 'RATE_LIMIT_EXCEEDED') {
          setRateLimitInfo({
            retryAfter: result.retryAfter,
            remainingAttempts: result.remainingAttempts
          });
        }
        
        // Throw error to be caught by headless component
        throw new Error(result.error || 'Login failed');
      }
    } catch (error: any) {
      // Handle rate limiting errors
      if (error?.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '900', 10) * 1000;
        setRateLimitInfo({
          retryAfter,
          remainingAttempts: parseInt(error.response.headers['x-ratelimit-remaining'] || '0', 10)
        });
      }
      
      addError({
        message: error instanceof Error ? error.message : 'Login failed',
        type: 'unexpected',
        section: 'auth',
        dismissAfter: 8000,
        sync: true,
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Unexpected error during login submission:', error);
      }
      
      // Re-throw error so headless component can handle UI state
      throw error;
    }
  };

  const handleResendVerification = async (email: string): Promise<void> => {
    setResendStatus(null);
    if (!email) {
      setResendStatus({ message: 'Please enter your email address first.', type: 'error' });
      return;
    }
    
    try {
      const result = await resendVerificationEmail(email);
      if (result.success) {
        setResendStatus({ message: 'Verification email sent successfully.', type: 'success' });
      } else {
        setResendStatus({ message: result.error ?? 'Failed to send verification email.', type: 'error' });
      }
    } catch (error) {
      setResendStatus({
        message: error instanceof Error ? error.message : 'Failed to send verification email.',
        type: 'error'
      });
    }
  };

  const handleMfaSuccess = (mfaUser: any, token: string): void => {
    // The auth service should handle session management internally
    // When MFA is successful, we just navigate to dashboard
    router.push('/dashboard/overview');
  };

  const handleLoginSuccess = (data: any): void => {
    // The auth service should handle session management internally
    // When login is successful, we just navigate to dashboard
    router.push('/dashboard/overview');
  };

  const handleMfaCancel = (): void => {
    clearState();
  };

  const handleRateLimitComplete = (): void => {
    setRateLimitInfo(null);
  };

  return {
    onSubmit,
    handleResendVerification,
    handleMfaSuccess,
    handleLoginSuccess,
    handleMfaCancel,
    handleRateLimitComplete,
    resendStatus,
    showResendLink,
    rateLimitInfo,
    mfaRequired,
    tempAccessToken,
    user,
    authErrors,
    authError,
    success,
    isLoading,
  };
}

export default useLoginFormLogic;

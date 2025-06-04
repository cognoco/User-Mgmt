import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { useLogin } from './useLogin';
import { useSectionErrors, useErrorStore } from '@/lib/state/errorStore';
import type { LoginPayload } from '@/core/auth/models';

export interface UseLoginFormLogic {
  handleSubmit: (credentials: LoginPayload) => Promise<void>;
  handleResendVerification: (email: string) => Promise<void>;
  handleMfaSuccess: (user: any, token: string) => void;
  handleLoginSuccess: (data: any) => void;
  handleMfaCancel: () => void;
  handleRateLimitComplete: () => void;
  resendStatus: { message: string; type: 'success' | 'error' } | null;
  showResendLink: boolean;
  rateLimitInfo: { retryAfter?: number; remainingAttempts?: number } | null;
  mfaRequired: boolean;
  tempAccessToken: string | null;
  authErrors: ReturnType<typeof useSectionErrors>;
  authError: string | null;
  success: string | null;
}

export function useLoginFormLogic(): UseLoginFormLogic {
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
  } = useLogin();

  const [resendStatus, setResendStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResendLink, setShowResendLink] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ retryAfter?: number; remainingAttempts?: number } | null>(null);
  const authErrors = useSectionErrors('auth');
  const addError = useErrorStore(state => state.addError);
  const clearAuthErrors = useErrorStore(state => state.clearErrors);

  const handleSubmit = async (credentials: LoginPayload) => {
    clearAuthErrors('auth');
    setResendStatus(null);
    setShowResendLink(false);
    clearState();
    setRateLimitInfo(null);

    try {
      const result = await login(credentials);

      if (result.success) {
        if (!result.requiresMfa) {
          router.push('/dashboard/overview');
        }
      } else {
        addError({
          message: result.error || 'Login failed',
          type: result.code,
          section: 'auth',
          dismissAfter: 8000,
          sync: true,
        });
        if (result.code === 'EMAIL_NOT_VERIFIED') {
          setShowResendLink(true);
        } else if (result.code === 'RATE_LIMIT_EXCEEDED') {
          setRateLimitInfo({ retryAfter: result.retryAfter, remainingAttempts: result.remainingAttempts });
        }
      }
    } catch (error: any) {
      if (error?.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '900', 10) * 1000;
        setRateLimitInfo({ retryAfter, remainingAttempts: parseInt(error.response.headers['x-ratelimit-remaining'] || '0', 10) });
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
    }
  };

  const handleResendVerification = async (email: string) => {
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
      setResendStatus({ message: error instanceof Error ? error.message : 'Failed to send verification email.', type: 'error' });
    }
  };

  const handleMfaSuccess = (mfaUser: any, token: string) => {
    authService.setSession?.(mfaUser, token);
    router.push('/dashboard/overview');
  };

  const handleLoginSuccess = (data: any) => {
    if (data?.user && data?.token) {
      authService.setSession?.(data.user, data.token);
    }
    router.push('/dashboard/overview');
  };

  const handleMfaCancel = () => {
    clearState();
  };

  const handleRateLimitComplete = () => {
    setRateLimitInfo(null);
  };

  return {
    handleSubmit,
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
    authErrors,
    authError,
    success,
  };
}

export default useLoginFormLogic;

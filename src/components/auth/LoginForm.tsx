'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/lib/stores/auth.store';
import { loginSchema, type LoginData, type AuthState } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { MFAVerificationForm } from './MFAVerificationForm';
import { RateLimitFeedback } from '@/components/common/RateLimitFeedback';
import { OAuthButtons } from './OAuthButtons';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, sendVerificationEmail, isLoading, error, clearError, setUser, setToken } = useAuthStore((state: AuthState) => ({
    login: state.login,
    sendVerificationEmail: state.sendVerificationEmail,
    isLoading: state.isLoading,
    error: state.error,
    clearError: state.clearError,
    setUser: state.setUser,
    setToken: state.setToken
  }));
  
  const [resendStatus, setResendStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResendLink, setShowResendLink] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [tempAccessToken, setTempAccessToken] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    retryAfter?: number;
    remainingAttempts?: number;
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginData) => {
    console.log("[DEBUG] LoginForm onSubmit triggered");
    clearError();
    setResendStatus(null);
    setShowResendLink(false);
    setMfaRequired(false);
    setTempAccessToken(null);
    setRateLimitInfo(null);

    const payload = { 
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe 
    };
    
    try {
      const result = await login(payload);

      if (result.success) {
        // Check if MFA is required
        if (result.requiresMfa) {
          setMfaRequired(true);
          setTempAccessToken(result.token ?? null);
        } else {
          router.push('/dashboard');
        }
      } else {
        if (result.code === 'EMAIL_NOT_VERIFIED') {
          setShowResendLink(true);
        } else if (result.code === 'RATE_LIMIT_EXCEEDED') {
          // Extract rate limit information from headers or response
          setRateLimitInfo({
            retryAfter: result.retryAfter,
            remainingAttempts: result.remainingAttempts
          });
        }
      }
    } catch (error: any) {
      // Check if the error is a rate limit error
      if (error?.response?.status === 429) {
        const retryAfter = parseInt(error.response.headers['retry-after'] || '900', 10) * 1000; // Convert to ms
        setRateLimitInfo({
          retryAfter,
          remainingAttempts: parseInt(error.response.headers['x-ratelimit-remaining'] || '0', 10)
        });
      }
      console.error("Unexpected error during login submission:", error);
    }
  };

  // Wrapper function to log data and errors before calling original onSubmit
  const handleSubmitWrapper = (data: LoginData) => {
    console.log("[DEBUG] handleSubmitWrapper called. Data:", data);
    console.log("[DEBUG] handleSubmitWrapper form errors:", errors);
    onSubmit(data); // Call the original submit handler
  };

  const handleResendVerification = async () => {
    setResendStatus(null);
    const email = watch('email');
    if (!email) {
      setResendStatus({ message: 'Please enter your email address first.', type: 'error' });
      return;
    }
    
    const result = await sendVerificationEmail(email);
    if (result.success) {
        setResendStatus({ message: result.message ?? 'Verification email sent.', type: 'success' });
    } else {
        setResendStatus({ message: result.error ?? 'Failed to send verification email.', type: 'error' });
    }
  };

  const handleMfaSuccess = (user: any, token: string) => {
    // Update auth store with authenticated user and token
    setUser(user);
    setToken(token);
    
    // Redirect to dashboard
    router.push('/dashboard');
  };

  // Cancel MFA verification and go back to password login
  const handleMfaCancel = () => {
    setMfaRequired(false);
    setTempAccessToken(null);
    clearError();
  };

  const handleRateLimitComplete = () => {
    setRateLimitInfo(null);
    clearError();
  };

  // If MFA is required, show the MFA verification form instead
  if (mfaRequired && tempAccessToken) {
    return (
      <MFAVerificationForm 
        accessToken={tempAccessToken}
        onSuccess={handleMfaSuccess}
        onCancel={handleMfaCancel}
      />
    );
  }

  return (
    <>
      <OAuthButtons mode="login" layout="vertical" className="mb-6" />
      <form onSubmit={handleSubmit(handleSubmitWrapper)} className="space-y-4">
        {rateLimitInfo && (
          <RateLimitFeedback
            windowMs={15 * 60 * 1000} // 15 minutes
            retryAfter={rateLimitInfo.retryAfter}
            remainingAttempts={rateLimitInfo.remainingAttempts}
            maxAttempts={100}
            onCountdownComplete={handleRateLimitComplete}
          />
        )}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-destructive text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
           <div className="flex items-center justify-between">
               <Label htmlFor="password">Password</Label>
           </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-destructive text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="rememberMe" 
            {...register('rememberMe')}
            aria-label="Remember me"
          />
          <Label htmlFor="rememberMe" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Remember me
          </Label>
        </div>

        {error && !rateLimitInfo && (
          <Alert variant="destructive">
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>
              {error}
              {showResendLink && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="text-primary hover:underline ml-2"
                >
                  Resend verification email
                </button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {resendStatus && (
          <Alert variant={resendStatus.type === 'success' ? 'default' : 'destructive'}>
            <AlertDescription>{resendStatus.message}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>

        <div className="flex flex-col space-y-2 text-center text-sm">
          <p className="text-muted-foreground">
            <a href="/forgot-password" className="font-medium text-primary hover:underline">
              Forgot password?
            </a>
          </p>
          <p className="text-muted-foreground">
            <a href="/register" className="font-medium text-primary hover:underline">
              Don&apos;t have an account? Sign up
            </a>
          </p>
        </div>
      </form>
    </>
  );
}
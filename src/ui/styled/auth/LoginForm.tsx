'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Alert, AlertDescription, AlertTitle } from '@/ui/primitives/alert';
import { Checkbox } from '@/ui/primitives/checkbox';
import { useAuth } from '@/hooks/auth/useAuth';
import { loginSchema, type LoginData } from '@/core/auth/models';
import { useRouter } from 'next/navigation';
import { MFAVerificationForm } from './MFAVerificationForm';
import { RateLimitFeedback } from '@/ui/styled/common/RateLimitFeedback';
import { OAuthButtons } from './OAuthButtons';
import { z } from 'zod';
import { ErrorBoundary, DefaultErrorFallback } from '@/ui/styled/common/ErrorBoundary';
import Link from 'next/link';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  // React 19 compatibility - Use individual primitive selectors instead of object destructuring
  // This is more efficient and avoids infinite loop with getServerSnapshot in React 19
  const login = useAuth().login;
  const sendVerificationEmail = useAuth().sendVerificationEmail;
  const isLoading = useAuth().isLoading;
  const error = useAuth().error;
  const clearError = useAuth().clearError;
  const setUser = useAuth().setUser;
  const setToken = useAuth().setToken;
  
  const [resendStatus, setResendStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResendLink, setShowResendLink] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [tempAccessToken, setTempAccessToken] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    retryAfter?: number;
    remainingAttempts?: number;
  } | null>(null);

  // Using React 19's useTransition for better loading state handling
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<
    z.input<typeof loginSchema>,
    any,
    z.output<typeof loginSchema>
  >({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginData) => {
    if (process.env.NODE_ENV === 'development') { console.log("[DEBUG] LoginForm onSubmit triggered"); }
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
      if (process.env.NODE_ENV === 'development') { console.error("Unexpected error during login submission:", error); }
    }
  };

  // Wrapper function to log data and errors before calling original onSubmit
  const handleSubmitWrapper = (data: LoginData) => {
    if (process.env.NODE_ENV === 'development') { console.log("[DEBUG] handleSubmitWrapper called. Data:", data); }
    if (process.env.NODE_ENV === 'development') { console.log("[DEBUG] handleSubmitWrapper form errors:", errors); }
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
        setResendStatus({ message: 'Verification email sent successfully.', type: 'success' });
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
    <ErrorBoundary fallback={DefaultErrorFallback}>
      <div className="w-full max-w-md mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sign in to your account</h2>
          <p className="text-muted-foreground mt-2">
            Enter your email below to sign in to your account
          </p>
        </div>
        
        <OAuthButtons />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        {rateLimitInfo && (
          <RateLimitFeedback
            windowMs={15 * 60 * 1000} // 15 minutes
            retryAfter={rateLimitInfo.retryAfter}
            remainingAttempts={rateLimitInfo.remainingAttempts}
            maxAttempts={100}
            onCountdownComplete={handleRateLimitComplete}
          />
        )}

        {formError && (
          <Alert variant="destructive">
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>
              {formError}
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
          <Alert variant={resendStatus.type === 'success' ? 'default' : 'destructive'} role="alert">
            <AlertDescription>{resendStatus.message}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(handleSubmitWrapper)} className="space-y-4">
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

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <div className="text-center text-sm">
          Don't have an account?{' '}
          <Link 
            href="/auth/register" 
            className="text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </ErrorBoundary>
  );
}
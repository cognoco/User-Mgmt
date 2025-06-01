'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Alert, AlertDescription, AlertTitle } from '@/ui/primitives/alert';
import { Checkbox } from '@/ui/primitives/checkbox';
import { useAuth } from '@/hooks/auth/useAuth';

import { useRouter } from 'next/navigation';
import { MFAVerificationForm } from './MFAVerificationForm';
import { RateLimitFeedback } from '@/ui/styled/common/RateLimitFeedback';
import { OAuthButtons } from './OAuthButtons';
import { ErrorBoundary, DefaultErrorFallback } from '@/ui/styled/common/ErrorBoundary';
import Link from 'next/link';
import { LoginForm as HeadlessLoginForm } from '@/ui/headless/auth/LoginForm';
import { LoginPayload } from '@/core/auth/models';
import { WebAuthnLogin } from '@/ui/styled/auth/WebAuthnLogin';

interface LoginFormProps {
  // Reserved for future use
}

const LoginForm: React.FC<LoginFormProps> = (): React.JSX.Element => {
  const router = useRouter();
  
  // React 19 compatibility - Use individual primitive selectors instead of object destructuring
  // This is more efficient and avoids infinite loop with getServerSnapshot in React 19
  const { login, error: authError, success, authService } = useAuth();
  const user = useAuth().user;
  
  const [resendStatus, setResendStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showResendLink, setShowResendLink] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [tempAccessToken, setTempAccessToken] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    retryAfter?: number;
    remainingAttempts?: number;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Handle custom form submission with MFA and rate limit handling
  const handleCustomSubmit = async (credentials: LoginPayload) => {
    // Reset state
    setFormError(null);
    setResendStatus(null);
    setShowResendLink(false);
    setMfaRequired(false);
    setTempAccessToken(null);
    setRateLimitInfo(null);
    
    try {
      const result = await login(credentials);

      if (result.success) {
        // Check if MFA is required
        if (result.requiresMfa) {
          setMfaRequired(true);
          setTempAccessToken(result.token ?? null);
        } else {
          router.push('/dashboard/overview');
        }
      } else {
        setFormError(result.error || 'Login failed');
        
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
      setFormError(error instanceof Error ? error.message : 'Login failed');
      if (process.env.NODE_ENV === 'development') { 
        console.error("Unexpected error during login submission:", error); 
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
      const result = await authService.sendVerificationEmail(email);
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

  const handleMfaSuccess = (user: any, token: string) => {
    // Update auth state with authenticated user and token
    authService.setSession?.(user, token);

    // Redirect to dashboard
    router.push('/dashboard/overview');
  };

  const handleLoginSuccess = (data: any) => {
    if (data?.user && data?.token) {
      authService.setSession?.(data.user, data.token);
    }
    router.push('/dashboard/overview');
  };

  // Cancel MFA verification and go back to password login
  const handleMfaCancel = () => {
    setMfaRequired(false);
    setTempAccessToken(null);
  };

  const handleRateLimitComplete = () => {
    setRateLimitInfo(null);
  };

  // If MFA is required, show the MFA verification form and WebAuthn option
  if (mfaRequired && tempAccessToken) {
    return (
      <>
        {user?.mfaMethods?.includes('webauthn') && (
          <WebAuthnLogin userId={user.id} onSuccess={handleLoginSuccess} />
        )}
        <MFAVerificationForm
          accessToken={tempAccessToken}
          onSuccess={handleMfaSuccess}
          onCancel={handleMfaCancel}
        />
      </>
    );
  }

  return (
    <ErrorBoundary fallback={DefaultErrorFallback}>
      <HeadlessLoginForm
        onSubmit={handleCustomSubmit}
        error={formError || authError}
        render={({ 
          handleSubmit, 
          emailValue, 
          setEmailValue, 
          passwordValue, 
          setPasswordValue, 
          rememberMeValue, 
          setRememberMeValue,
          isSubmitting,
          isValid,
          errors,
          touched,
          handleBlur
        }) => (
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

            {(errors.form || formError) && (
              <Alert variant="destructive">
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>
                  {errors.form || formError}
                  {showResendLink && (
                    <button
                      type="button"
                      onClick={() => handleResendVerification(emailValue)}
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
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {touched.email && errors.email && (
                  <p id="email-error" className="text-destructive text-sm mt-1">
                    {errors.email}
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
                    value={passwordValue}
                    onChange={(e) => setPasswordValue(e.target.value)}
                    onBlur={() => handleBlur('password')}
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
                {touched.password && errors.password && (
                  <p id="password-error" className="text-destructive text-sm mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMeValue}
                  onCheckedChange={(checked) => {
                    // Handle the checked value properly - it can be boolean, "indeterminate", or other values
                    setRememberMeValue(checked === true);
                  }}
                  aria-label="Remember me"
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </Label>
                <span
                  className="text-xs text-muted-foreground"
                  title="Keep me logged in on this device for up to 30 days"
                  aria-label="Remember me help"
                >
                  ?
                </span>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            
              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
              <Link 
                href="/auth/register" 
                className="text-primary hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      />
    </ErrorBoundary>
  );
}

export default LoginForm;
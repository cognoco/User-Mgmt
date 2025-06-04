'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Alert, AlertDescription, AlertTitle } from '@/ui/primitives/alert';
import { Checkbox } from '@/ui/primitives/checkbox';
import useLoginFormLogic from '@/hooks/auth/useLoginFormLogic';
import { ErrorBoundary, DefaultErrorFallback } from '@/ui/styled/common/ErrorBoundary';
import { RateLimitFeedback } from '@/ui/styled/common/RateLimitFeedback';
import { OAuthButtons } from './OAuthButtons';
import { MFAVerificationForm } from './MFAVerificationForm';
import { WebAuthnLogin } from '@/ui/styled/auth/WebAuthnLogin';
import { LoginForm as HeadlessLoginForm } from '@/ui/headless/auth/LoginForm';
import Link from 'next/link';
import type { LoginPayload } from '@/core/auth/models';

interface LoginFormProps {
  onSubmit?: (credentials: LoginPayload) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
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
  } = useLoginFormLogic();

  if (mfaRequired && tempAccessToken) {
    return (
      <>
        {/** WebAuthn option if available */}
        <WebAuthnLogin userId={''} onSuccess={handleLoginSuccess} />
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
        onSubmit={onSubmit || handleSubmit}
        error={authErrors[0]?.message || authError}
        render={({
          handleSubmit: formSubmit,
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
          handleBlur,
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
                windowMs={15 * 60 * 1000}
                retryAfter={rateLimitInfo.retryAfter}
                remainingAttempts={rateLimitInfo.remainingAttempts}
                maxAttempts={100}
                onCountdownComplete={handleRateLimitComplete}
              />
            )}

            {(errors.form || authErrors.length > 0) && (
              <Alert variant="destructive">
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>
                  {errors.form || authErrors[0]?.message}
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
              <Alert
                variant={resendStatus.type === 'success' ? 'default' : 'destructive'}
                role="alert"
              >
                <AlertDescription>{resendStatus.message}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={formSubmit} className="space-y-4">
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
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  onCheckedChange={(checked) => setRememberMeValue(checked === true)}
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
              <Link href="/auth/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        )}
      />
    </ErrorBoundary>
  );
};

export default LoginForm;
export { LoginForm };

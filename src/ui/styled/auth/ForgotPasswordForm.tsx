'use client';

import { useAuth } from '@/hooks/auth/useAuth';
import { Input } from '@/ui/primitives/input';
import { Button } from '@/ui/primitives/button';
import { Label } from '@/ui/primitives/label';
import { Alert, AlertDescription, AlertTitle } from '@/ui/primitives/alert';
import ForgotPasswordFormHeadless from '@/ui/headless/auth/ForgotPasswordForm';

export function ForgotPasswordForm() {
  const { successMessage } = useAuth();

  return (
    <ForgotPasswordFormHeadless
      render={({
        handleSubmit,
        emailValue,
        setEmailValue,
        isSubmitting,
        isSuccess,
        errors,
        touched,
        handleBlur
      }) => (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSuccess && successMessage && !errors.form && (
              <Alert variant="default" className="bg-green-100 border-green-300 text-green-800" role="alert">
                <AlertTitle>Request Sent</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {errors.form && (
              <Alert variant="destructive" role="alert">
                <AlertTitle>Request Failed</AlertTitle>
                <AlertDescription>{errors.form}</AlertDescription>
              </Alert>
            )}

            {!successMessage && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    onBlur={handleBlur}
                    disabled={isSubmitting}
                    aria-invalid={touched.email && errors.email ? 'true' : 'false'}
                  />
                  {touched.email && errors.email && (
                    <p className="text-destructive text-sm mt-1" role="alert">{errors.email}</p>
                  )}
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </>
            )}
          </form>
          <div className="text-center text-sm mt-6">
            <a href="/login" className="font-medium text-primary hover:underline">
              Back to login
            </a>
          </div>
        </>
      )}
    />
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Alert, AlertDescription } from '@/ui/primitives/alert';
import { useAuth } from '@/hooks/auth/useAuth';

export function EmailVerification() {
  const verifyEmail = useAuth().verifyEmail;
  const sendVerificationEmail = useAuth().sendVerificationEmail;
  const isLoading = useAuth().isLoading;
  const error = useAuth().error;
  const successMessage = useAuth().successMessage;
  const clearError = useAuth().clearError;
  const clearSuccess = useAuth().clearSuccessMessage;

  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    clearSuccess();
    setSubmitted(false);
    try {
      await verifyEmail(token);
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    clearSuccess();
    setSubmitted(false);
    try {
      await sendVerificationEmail(email);
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      {submitted && error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {submitted && successMessage && !error && (
        <Alert>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token">Verification Token</Label>
          <Input
            id="token"
            value={token}
            onChange={e => setToken(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          Verify Email
        </Button>
      </form>

      <form onSubmit={handleResend} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" variant="outline" disabled={isLoading} className="w-full">
          Resend Verification Email
        </Button>
      </form>
    </div>
  );
}

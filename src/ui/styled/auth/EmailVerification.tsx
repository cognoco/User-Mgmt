'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/lib/stores/auth.store';

export function EmailVerification() {
  const verifyEmail = useAuthStore(state => state.verifyEmail);
  const sendVerificationEmail = useAuthStore(state => state.sendVerificationEmail);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  const successMessage = useAuthStore(state => state.successMessage);
  const clearError = useAuthStore(state => state.clearError);
  const clearSuccess = useAuthStore(state => state.clearSuccessMessage);

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

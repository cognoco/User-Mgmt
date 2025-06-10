import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/ui/primitives/input';
import { Button } from '@/ui/primitives/button';
import { Label } from '@/ui/primitives/label';
import { Alert, AlertDescription } from '@/ui/primitives/alert';
import { EmailVerification as EmailVerificationHeadless } from '@/ui/headless/auth/EmailVerification';

interface EmailVerificationProps {
  email?: string;
}

interface EmailVerificationRenderProps {
  token: string;
  setToken: (token: string) => void;
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  handleVerify: (e: React.FormEvent) => void;
  handleResend: (e: React.FormEvent) => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ email: initialEmail }): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <EmailVerificationHeadless
      render={({
        token,
        setToken,
        email,
        setEmail,
        isLoading,
        error,
        successMessage,
        handleVerify,
        handleResend
      }: EmailVerificationRenderProps) => (
        <div className="space-y-6 w-full max-w-md mx-auto">
          {error && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && !error && (
            <Alert>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">{t('auth.verificationToken', 'Verification Token')}</Label>
              <Input
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {t('auth.verifyEmail', 'Verify Email')}
            </Button>
          </form>
          <form onSubmit={handleResend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email || initialEmail || ''}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" variant="outline" disabled={isLoading} className="w-full">
              {t('auth.resendVerification', 'Resend Verification Email')}
            </Button>
          </form>
        </div>
      )}
    />
  );
}

export default EmailVerification;

import { useTranslation } from 'react-i18next';
import { Input } from '@/ui/primitives/input';
import { Button } from '@/ui/primitives/button';
import { Label } from '@/ui/primitives/label';
import { Alert, AlertDescription } from '@/ui/primitives/alert';
import EmailVerificationHeadless from '@/ui/headless/auth/EmailVerification';

export function EmailVerification() {
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
      }) => (
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
                value={email}
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

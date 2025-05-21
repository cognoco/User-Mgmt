'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

// Import from our new architecture
import { usePasswordReset } from '@/hooks/auth/use-password-reset';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Alert, AlertDescription, AlertTitle } from '@/ui/primitives/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/ui/primitives/card';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [success, setSuccess] = useState<string | null>(null);
  
  // Use our hook from the new architecture
  const { 
    updatePassword,
    isTokenValid,
    isLoading,
    error,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    passwordRequirements,
    passwordStrength,
    validatePasswords
  } = usePasswordReset();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (!validatePasswords()) {
      return;
    }
    
    // Use our hook's updatePassword method
    const result = await updatePassword(password);
    
    if (result.success) {
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        {t('auth.updatePassword.title', 'Set New Password')}
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('auth.updatePassword.formTitle', 'Update Password')}</CardTitle>
          <CardDescription>
            {t('auth.updatePassword.formDescription', 'Create a new secure password for your account')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isTokenValid === null && (
            <p className="text-center text-muted-foreground">
              {t('auth.updatePassword.verifyingLink', 'Verifying link...')}
            </p>
          )}

          {success && (
            <Alert variant="default" className="bg-green-100 border-green-300 text-green-800">
              <AlertTitle>{t('common.success', 'Success!')}</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>{t('common.error', 'Error')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
              {(error.includes('expired') || error.includes('Invalid')) && (
                <Button 
                  variant="link" 
                  onClick={() => router.push('/reset-password')} 
                  className="p-0 h-auto mt-2 text-destructive hover:text-destructive/80 font-medium underline underline-offset-4"
                >
                  {t('auth.updatePassword.requestNewLink', 'Request a new reset link')}
                </Button>
              )}
            </Alert>
          )}

          {isTokenValid === true && !success && !error && (
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">{t('auth.updatePassword.newPassword', 'New Password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                
                {/* Password strength indicator */}
                <div className="h-1 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength === 'strong' ? 'bg-green-500' : passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${passwordStrength === 'strong' ? '100%' : passwordStrength === 'medium' ? '66%' : '33%'}` }}
                  />
                </div>
                
                {/* Password requirements */}
                <ul className="text-xs mt-2 space-y-1">
                  {passwordRequirements.map((req) => (
                    <li key={req.text} className="flex items-center">
                      <span className={req.valid ? 'text-green-500' : 'text-gray-500'}>
                        {req.valid ? '✓' : '○'} {req.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">{t('auth.updatePassword.confirmPassword', 'Confirm New Password')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !validatePasswords(false)}
              >
                {isLoading ? t('auth.updatePassword.updating', 'Updating Password...') : t('auth.updatePassword.update', 'Update Password')}
              </Button>
            </form>
          )}

          {(isTokenValid === false || success || (isTokenValid === true && error)) && (
            <div className="text-center text-sm mt-6">
              <Button 
                variant="link" 
                onClick={() => router.push('/login')} 
                className="p-0 h-auto font-medium text-primary hover:underline"
              >
                {t('auth.updatePassword.returnToLogin', 'Return to Login')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
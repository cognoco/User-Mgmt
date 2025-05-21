'use client';
import '@/lib/i18n';

import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/ui/primitives/skeleton';
import { Alert, AlertDescription } from '@/ui/primitives/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import Link from 'next/link';

// Import from our new architecture
import { MFASetup } from '@/ui/styled/auth/MFASetup';
import { useMFA } from '@/hooks/auth/useMFA';

export default function SecuritySettingsPage() {
  const { t } = useTranslation();
  
  // Use our hooks from the new architecture
  const {
    setupMFA,
    verifyMFA,
    disableMFA,
    setupData,
    isLoading,
    error,
    isMFAEnabled
  } = useMFA();

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold"><Skeleton className="h-8 w-48" /></h1>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // Show error message
  if (error) {
     return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto space-y-8">
           <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-center md:text-left">
          {t('security.title', 'Security Settings')}
        </h1>
        
        {isMFAEnabled ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('security.mfa.enabled.title', 'Two-Factor Authentication Enabled')}</CardTitle>
              <CardDescription>
                {t('security.mfa.enabled.description', 'Your account is protected with two-factor authentication')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('security.mfa.enabled.info', 'You will be asked for a verification code when signing in')}
              </p>
              <Button 
                variant="destructive"
                onClick={disableMFA}
              >
                {t('security.mfa.disable', 'Disable Two-Factor Authentication')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <MFASetup
            title={t('security.mfa.setup.title', 'Set Up Two-Factor Authentication')}
            description={t('security.mfa.setup.description', 'Add an extra layer of security to your account')}
            onSetupMFA={setupMFA}
            onVerifyMFA={verifyMFA}
            footer={
              <div className="text-center text-sm w-full">
                <Link href="/settings" className="text-primary hover:underline">
                  {t('security.backToSettings', 'Back to Settings')}
                </Link>
              </div>
            }
          />
        )}
        
        {/* Password Security Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('security.password.title', 'Password Security')}</CardTitle>
            <CardDescription>
              {t('security.password.description', 'Manage your password and account security')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('security.password.lastChanged', 'Your password was last changed on:')} {new Date().toLocaleDateString()}
            </p>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/settings'}
            >
              {t('security.password.change', 'Change Password')}
            </Button>
          </CardContent>
        </Card>
        
        {/* Recent Activity Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('security.activity.title', 'Recent Activity')}</CardTitle>
            <CardDescription>
              {t('security.activity.description', 'Monitor recent sign-ins to your account')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('security.activity.viewAll', 'View all activity in your account settings')}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.href = '/settings'}
            >
              {t('security.activity.goToSettings', 'View in Settings')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { PasswordResetForm } from '@/src/ui/styled/auth/PasswordResetForm';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  
  return (
    <div className="container max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        {t('auth.resetPassword.title', 'Reset Your Password')}
      </h1>
      <PasswordResetForm
        title={t('auth.resetPassword.formTitle', 'Reset Password')}
        description={t('auth.resetPassword.formDescription', 'Enter your email to receive a password reset link')}
        footer={
          <div className="text-center text-sm w-full">
            <div className="mt-2">
              <Link href="/login" className="text-primary hover:underline">
                {t('auth.resetPassword.backToLogin', 'Back to login')}
              </Link>
            </div>
          </div>
        }
      />
    </div>
  );
}
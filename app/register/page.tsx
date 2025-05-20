'use client'; // Required for hooks like useTranslation
import '@/lib/i18n';

import { useTranslation } from 'react-i18next';
import Link from 'next/link'; // Import from next/link
import { RegistrationForm } from '@/ui/styled/auth/RegistrationForm';

export default function RegisterPage() { // Use default export for Next.js pages
  const { t } = useTranslation();

  return (
    <div className="container max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        {t('auth.register.title', 'Create Your Account')}
      </h1>
      <RegistrationForm 
        title={t('auth.register.formTitle', 'Sign Up')}
        description={t('auth.register.formDescription', 'Enter your information to create a new account')}
        termsLink="/terms"
        privacyLink="/privacy"
        footer={
          <div className="text-center text-sm w-full">
            <div className="mt-2">
              {t('auth.register.alreadyHaveAccount', 'Already have an account?')}{' '}
              <Link href="/login" className="text-primary font-medium hover:underline">
                {t('auth.register.signIn', 'Sign in')}
              </Link>
            </div>
          </div>
        }
      />
    </div>
  );
}
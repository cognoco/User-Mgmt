'use client'; // Required for hooks like useTranslation

import { useTranslation } from 'react-i18next';
import Link from 'next/link'; // Import from next/link
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() { // Use default export for Next.js pages
  const { t } = useTranslation();

  return (
    <div className="container max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        {t('auth.login.title', 'Welcome Back')}
      </h1>
      <div className="bg-card rounded-lg shadow p-6"> {/* Use theme-aware background */} 
        <LoginForm />
        <div className="mt-4 text-sm text-center space-y-2">
          <p>
            {/* Use href instead of to */}
            <Link href="/reset-password" className="text-primary hover:underline">
              {t('auth.login.forgotPassword', 'Forgot your password?')}
            </Link>
          </p>
          <p>
            {t('auth.login.noAccount', "Don't have an account?")} {' '}
            {/* Use href instead of to */}
            <Link href="/register" className="text-primary hover:underline">
              {t('auth.login.signUp', 'Sign up')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 
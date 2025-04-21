'use client'; // Required for hooks like useTranslation

import { useTranslation } from 'react-i18next';
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
      </div>
    </div>
  );
} 
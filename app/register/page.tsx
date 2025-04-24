'use client'; // Required for hooks like useTranslation

import { useTranslation } from 'react-i18next';
import Link from 'next/link'; // Import from next/link
import { RegistrationForm } from '@/components/auth/RegistrationForm';

export default function RegisterPage() { // Use default export for Next.js pages
  const { t } = useTranslation();

  return (
    <div className="container max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        {t('auth.register.title', 'Create Your Account')}
      </h1>
      <div className="bg-card rounded-lg shadow p-6"> {/* Use theme-aware background */} 
        <RegistrationForm />
      </div>
    </div>
  );
} 
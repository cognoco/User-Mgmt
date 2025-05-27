'use client';
import '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { PasswordlessLogin } from '@/ui/styled/auth/PasswordlessLogin';
import Link from 'next/link';

export default function PasswordlessPage() {
  const { t } = useTranslation();
  return (
    <div className="container max-w-md mx-auto py-12 space-y-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        {t('auth.magicLink.title', 'Login with Magic Link')}
      </h1>
      <PasswordlessLogin />
      <p className="text-center text-sm">
        <Link href="/auth/login" className="text-primary hover:underline">
          {t('auth.magicLink.backToLogin', 'Back to regular login')}
        </Link>
      </p>
    </div>
  );
}

'use client';
import '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { SessionManager } from '@/ui/styled/session/SessionManager';

export default function SessionsPage() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-center md:text-left">
        {t('sessions.title', 'Active Sessions')}
      </h1>
      <SessionManager />
    </div>
  );
}

'use client';
import '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import ActivityLog from '@/ui/styled/profile/ActivityLog';

export default function ActivityPage() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-center md:text-left">
        {t('activityLog.title', 'Account Activity')}
      </h1>
      <ActivityLog />
    </div>
  );
}


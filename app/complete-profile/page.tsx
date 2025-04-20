'use client'; // Required for useTranslation and likely ProfileCompletion component

import { useTranslation } from 'react-i18next';
import { ProfileCompletion } from '@/components/registration/ProfileCompletion'; // Adjust path if needed

export default function ProfileCompletionPage() {
  const { t } = useTranslation();

  return (
    <div className="container max-w-2xl mx-auto py-8"> {/* Standard container/padding */} 
      <h1 className="text-3xl font-bold mb-8">{t('profile.setup.title', 'Complete Your Profile')}</h1>
      <div className="bg-card rounded-lg shadow p-6"> {/* Use card background */} 
        <ProfileCompletion />
      </div>
    </div>
  );
} 
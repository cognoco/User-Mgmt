'use client';

import { useEffect, useState } from 'react';
import { usePreferencesStore } from '@/lib/stores/preferences.store';

export interface ConsentManagementProps {
  render: (props: {
    marketing: boolean;
    setMarketing: (val: boolean) => void;
    isLoading: boolean;
    error: string | null;
    submitted: boolean;
    handleSave: () => Promise<void>;
  }) => React.ReactNode;
}

export function ConsentManagement({ render }: ConsentManagementProps) {
  const { preferences, fetchPreferences, updatePreferences, isLoading, error } = usePreferencesStore();
  const [marketing, setMarketing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!preferences) fetchPreferences();
  }, [preferences, fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      setMarketing(!!preferences.notifications?.marketing);
    }
  }, [preferences]);

  const handleSave = async () => {
    setSubmitted(false);
    await updatePreferences({
      notifications: {
        ...preferences?.notifications,
        marketing,
      },
    });
    setSubmitted(true);
  };

  return (
    <>{render({ marketing, setMarketing, isLoading, error, submitted, handleSave })}</>
  );
}

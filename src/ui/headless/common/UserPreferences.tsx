import { useEffect, useState } from 'react';
import { usePreferencesStore } from '@/lib/stores/preferences.store';
import { useAuth } from '@/hooks/auth/useAuth';
import type { UserPreferences } from '@/types/database';
import { getBrowserLanguage, getBrowserTimezone, getDefaultDateFormat } from '@/lib/utils';

/**
 * Headless User Preferences
 */
export default function UserPreferencesComponent({
  render
}: {
  render: (props: {
    form: UserPreferences;
    setForm: (val: UserPreferences) => void;
    isLoading: boolean;
    error?: string;
    successMsg: string;
    validationError: string;
    handleSave: () => Promise<void>;
    handleReset: () => Promise<void>;
  }) => React.ReactNode;
}) {
  const { preferences, isLoading, error, fetchPreferences, updatePreferences } = usePreferencesStore();
  const { user } = useAuth();

  const DEFAULT_PREFERENCES: UserPreferences = {
    id: '',
    userId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    language: getBrowserLanguage() || 'en',
    theme: 'system',
    notifications: { email: true, push: true, marketing: false },
    itemsPerPage: 25,
    timezone: getBrowserTimezone() || 'UTC',
    dateFormat: getDefaultDateFormat(getBrowserLanguage()) || 'YYYY-MM-DD'
  } as UserPreferences;

  const [form, setForm] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [successMsg, setSuccessMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (user && !preferences) fetchPreferences();
  }, [user, preferences, fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      setForm({
        ...DEFAULT_PREFERENCES,
        ...preferences,
        createdAt: preferences.createdAt ? new Date(preferences.createdAt) : new Date(),
        updatedAt: preferences.updatedAt ? new Date(preferences.updatedAt) : new Date()
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    if (form.itemsPerPage > 100) {
      setValidationError('maximum allowed is 100');
      return;
    }
    setValidationError('');
    const ok = await updatePreferences(form);
    if (ok) setSuccessMsg('saved');
  };

  const handleReset = async () => {
    const resetDefaults = { ...DEFAULT_PREFERENCES };
    setForm(resetDefaults);
    await updatePreferences(resetDefaults);
    setSuccessMsg('reset');
  };

  return (
    <>{render({ form, setForm, isLoading, error: error || undefined, successMsg, validationError, handleSave, handleReset })}</>
  );
}

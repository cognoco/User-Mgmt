import React, { useEffect, useState } from 'react';
import { usePreferencesStore } from '@/lib/stores/preferences.store';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

/**
 * UserPreferences Component
 * Placeholder for managing user preferences (e.g., language, theme).
 */

// Types for props (for modular/host integration)
interface UserPreferencesProps {
  onSave?: () => void;
  onReset?: () => void;
  onError?: (error: string) => void;
}

const DEFAULTS = {
  language: 'en',
  theme: 'system',
  itemsPerPage: 25,
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
};

export const UserPreferences: React.FC<UserPreferencesProps> = ({ onSave, onReset, onError }) => {
  const { t } = useTranslation();
  const { preferences, isLoading, error, fetchPreferences, updatePreferences } = usePreferencesStore();
  const { user } = useAuthStore();

  // Local state for form
  const [form, setForm] = useState({
    language: DEFAULTS.language,
    theme: DEFAULTS.theme,
    itemsPerPage: DEFAULTS.itemsPerPage,
    timezone: DEFAULTS.timezone,
    dateFormat: DEFAULTS.dateFormat,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [validationError, setValidationError] = useState('');

  // Load preferences on mount
  useEffect(() => {
    if (user && !preferences) fetchPreferences();
    // eslint-disable-next-line
  }, [user]);

  // Sync store to form
  useEffect(() => {
    if (preferences) {
      setForm({
        language: preferences.language || DEFAULTS.language,
        theme: preferences.theme || DEFAULTS.theme,
        itemsPerPage: (preferences as any).items_per_page || DEFAULTS.itemsPerPage,
        timezone: (preferences as any).timezone || DEFAULTS.timezone,
        dateFormat: (preferences as any).date_format || DEFAULTS.dateFormat,
      });
    }
  }, [preferences]);

  // Theme application
  useEffect(() => {
    if (form.theme) {
      const root = document.documentElement;
      root.classList.remove('light-theme', 'dark-theme', 'system-theme');
      if (form.theme === 'light') root.classList.add('light-theme');
      else if (form.theme === 'dark') root.classList.add('dark-theme');
      else root.classList.add('system-theme');
    }
  }, [form.theme]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'itemsPerPage' ? Number(value) : value }));
    setValidationError('');
  };

  const handleSave = async () => {
    // Validation
    if (form.itemsPerPage > 100) {
      setValidationError(t('maximum allowed is 100'));
      return;
    }
    setValidationError('');
    const updatePayload: any = {
      language: form.language,
      theme: form.theme as 'light' | 'dark' | 'system',
      itemsPerPage: form.itemsPerPage,
      timezone: form.timezone,
      dateFormat: form.dateFormat,
    };
    const ok = await updatePreferences(updatePayload);
    if (ok) {
      setSuccessMsg(t('preferences saved'));
      onSave?.();
    } else {
      onError?.(error || t('error saving preferences'));
    }
  };

  const handleReset = async () => {
    setShowResetModal(false);
    setForm({ ...DEFAULTS });
    await updatePreferences({ ...DEFAULTS });
    setSuccessMsg(t('preferences reset'));
    onReset?.();
  };

  // UI
  return (
    <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-900 rounded shadow">
      <h2 className="text-xl font-bold mb-4">{t('user preferences')}</h2>
      {isLoading && <div role="status">{t('loading')}...</div>}
      {error && <div role="alert" className="text-red-600">{t(error)}</div>}
      {validationError && <div role="alert" className="text-red-600">{validationError}</div>}
      {successMsg && <div role="status" className="text-green-600">{successMsg}</div>}
      <form
        onSubmit={e => { e.preventDefault(); handleSave(); }}
        aria-label={t('user preferences')}
      >
        <div className="mb-4">
          <label htmlFor="language-select" className="block mb-1">{t('language')}</label>
          <select
            id="language-select"
            name="language"
            value={form.language}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          >
            <option value="en">{t('english')}</option>
            <option value="es">{t('spanish')}</option>
            <option value="fr">{t('french')}</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="theme-select" className="block mb-1">{t('theme')}</label>
          <select
            id="theme-select"
            name="theme"
            value={form.theme}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          >
            <option value="light">{t('light')}</option>
            <option value="dark">{t('dark')}</option>
            <option value="system">{t('system')}</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="items-per-page" className="block mb-1">{t('items per page')}</label>
          <input
            id="items-per-page"
            name="itemsPerPage"
            type="number"
            min={1}
            max={100}
            value={form.itemsPerPage}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
            aria-describedby="items-per-page-help"
          />
          <small id="items-per-page-help" className="text-gray-500">{t('maximum allowed is 100')}</small>
        </div>
        <button
          type="button"
          className="mb-2 text-blue-600 underline"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
        >
          {showAdvanced ? t('hide advanced settings') : t('show advanced settings')}
        </button>
        {showAdvanced && (
          <div className="mb-4">
            <label htmlFor="timezone" className="block mb-1">{t('timezone')}</label>
            <input
              id="timezone"
              name="timezone"
              type="text"
              value={form.timezone}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 mb-2"
            />
            <label htmlFor="date-format" className="block mb-1">{t('date format')}</label>
            <input
              id="date-format"
              name="dateFormat"
              type="text"
              value={form.dateFormat}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded"
            onClick={() => setShowResetModal(true)}
          >
            {t('reset to defaults')}
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-1 rounded"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {t('save')}
          </button>
        </div>
      </form>
      {/* Reset confirmation modal */}
      <AlertDialog open={showResetModal} onOpenChange={setShowResetModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('reset preferences')}</AlertDialogTitle>
            <AlertDialogDescription>{t('are you sure you want to reset your preferences to defaults?')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowResetModal(false)}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-red-600 text-white">
              {t('reset')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserPreferences;
// Props: onSave, onReset, onError for host integration
// Emits: calls these props on respective actions
// Accessible: all fields labeled, modal uses Dialog, ARIA roles
// i18n: all text via useTranslation
// Integrates Zustand, Supabase, applies theme immediately 
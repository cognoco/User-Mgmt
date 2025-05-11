import React, { useEffect, useState } from 'react';
import { usePreferencesStore } from '@/lib/stores/preferences.store';

/**
 * ThemeSettings Component
 * Placeholder for managing theme settings.
 */
export const ThemeSettings: React.FC = () => {
  const { preferences, fetchPreferences, updatePreferences, isLoading, error } = usePreferencesStore();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  // Fetch preferences on mount
  useEffect(() => {
    if (!preferences && !isLoading && !error) {
      fetchPreferences();
    }
  }, [preferences, isLoading, error, fetchPreferences]);

  // Set theme from preferences when loaded
  useEffect(() => {
    if (preferences?.theme) {
      setTheme(preferences.theme as 'light' | 'dark' | 'system');
      // Apply theme to DOM
      const root = document.documentElement;
      root.classList.remove('light-theme', 'dark-theme', 'system-theme');
      if (preferences.theme === 'light') root.classList.add('light-theme');
      else if (preferences.theme === 'dark') root.classList.add('dark-theme');
      else root.classList.add('system-theme');
    }
  }, [preferences?.theme]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    // Apply theme to DOM immediately
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme', 'system-theme');
    if (newTheme === 'light') root.classList.add('light-theme');
    else if (newTheme === 'dark') root.classList.add('dark-theme');
    else root.classList.add('system-theme');
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    const ok = await updatePreferences({ theme });
    if (ok) setSuccess('Theme preference saved!');
    setSaving(false);
  };

  return (
    <div>
      <h2>Theme Settings</h2>
      <fieldset>
        <legend>Select Theme:</legend>
        <div>
          <input
            type="radio"
            id="light"
            name="theme"
            value="light"
            checked={theme === 'light'}
            onChange={() => handleThemeChange('light')}
          />
          <label htmlFor="light">Light</label>
        </div>
        <div>
          <input
            type="radio"
            id="dark"
            name="theme"
            value="dark"
            checked={theme === 'dark'}
            onChange={() => handleThemeChange('dark')}
          />
          <label htmlFor="dark">Dark</label>
        </div>
        <div>
          <input
            type="radio"
            id="system"
            name="theme"
            value="system"
            checked={theme === 'system'}
            onChange={() => handleThemeChange('system')}
          />
          <label htmlFor="system">System</label>
        </div>
      </fieldset>
      <button type="button" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Theme'}
      </button>
      {success && <div role="status" className="text-green-600">{success}</div>}
      {error && <div role="alert" className="text-red-600">{error}</div>}
    </div>
  );
};

export default ThemeSettings; 
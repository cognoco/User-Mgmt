import React, { useEffect, useState } from 'react';

interface NotificationPrefs {
  email?: boolean;
  push?: boolean;
  marketing?: boolean;
}

const defaultPrefs: NotificationPrefs = {
  email: true,
  push: true,
  marketing: false,
};

const NotificationPreferences: React.FC = () => {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/profile/notifications')
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setPrefs({ ...defaultPrefs, ...data.notifications });
      })
      .catch(() => setError('Failed to load notification preferences.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: keyof NotificationPrefs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrefs((prev) => ({ ...prev, [key]: e.target.checked }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess('Notification preferences saved successfully.');
    } catch {
      setError('Failed to save notification preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded border p-4 max-w-lg mx-auto bg-white shadow mt-6">
      <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
      {loading ? (
        <div className="text-gray-500" role="status">Loading preferences...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={!!prefs.email}
                onChange={handleChange('email')}
                className="mr-2"
              />
              Email Notifications
            </label>
            <div className="text-xs text-gray-500 ml-6">Security alerts, account activity, important updates</div>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={!!prefs.push}
                onChange={handleChange('push')}
                className="mr-2"
              />
              Push Notifications
            </label>
            <div className="text-xs text-gray-500 ml-6">Browser/device notifications (requires permission)</div>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={!!prefs.marketing}
                onChange={handleChange('marketing')}
                className="mr-2"
              />
              Product & Marketing Updates
            </label>
            <div className="text-xs text-gray-500 ml-6">Tips, tutorials, new features, and offers</div>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
            {success && <span className="text-green-600 text-sm" role="alert">{success}</span>}
            {error && <span className="text-red-600 text-sm" role="alert">{error}</span>}
          </div>
        </form>
      )}
    </div>
  );
};

export default NotificationPreferences;

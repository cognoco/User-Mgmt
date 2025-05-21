'use client';

import { useEffect, useState } from 'react';
import { usePreferencesStore } from '@/lib/stores/preferences.store';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ConsentManagement() {
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
    <div className="space-y-4 w-full max-w-md mx-auto">
      {submitted && error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {submitted && !error && (
        <Alert>
          <AlertDescription>Preferences updated</AlertDescription>
        </Alert>
      )}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="marketing-consent"
          checked={marketing}
          onCheckedChange={val => setMarketing(val === true)}
        />
        <Label htmlFor="marketing-consent">Allow marketing emails</Label>
      </div>
      <Button onClick={handleSave} disabled={isLoading}>Save</Button>
    </div>
  );
}

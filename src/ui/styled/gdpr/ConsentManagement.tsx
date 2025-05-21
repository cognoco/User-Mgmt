'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConsentManagement as HeadlessConsentManagement } from '../../headless/gdpr/ConsentManagement';

export function ConsentManagement() {
  return (
    <HeadlessConsentManagement
      render={({ marketing, setMarketing, isLoading, error, submitted, handleSave }) => (
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
      )}
    />
  );
}

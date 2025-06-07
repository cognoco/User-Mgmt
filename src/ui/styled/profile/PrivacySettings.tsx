import { PrivacySettings as HeadlessPrivacySettings } from '@/ui/headless/profile/PrivacySettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Switch } from '@/src/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';

export function PrivacySettings() {
  return (
    <HeadlessPrivacySettings
      render={({
        visibility,
        setVisibility,
        showEmail,
        toggleShowEmail,
        showPhone,
        toggleShowPhone,
        isLoading,
      }) => (
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <Select
                value={visibility}
                onValueChange={setVisibility}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="contacts">Contacts Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showEmail">Show Email Address</Label>
                <Switch
                  id="showEmail"
                  checked={showEmail}
                  onCheckedChange={toggleShowEmail}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showPhone">Show Phone Number</Label>
                <Switch
                  id="showPhone"
                  checked={showPhone}
                  onCheckedChange={toggleShowPhone}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    />
  );
}
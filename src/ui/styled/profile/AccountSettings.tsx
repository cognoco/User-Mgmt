import React from 'react';
import { AccountSettings as HeadlessAccountSettings, AccountSettingsProps } from '@/ui/headless/profile/AccountSettings';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/primitives/tabs';
import { Button } from '@/ui/primitives/button';
import { Label } from '@/ui/primitives/label';
import { Switch } from '@/ui/primitives/switch';
import { Alert, AlertDescription } from '@/ui/primitives/alert';
import { CheckCircledIcon } from '@radix-ui/react-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/ui/primitives/select';

export interface StyledAccountSettingsProps extends Omit<AccountSettingsProps, 'render'> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
}

export function AccountSettings({
  title = 'Account Settings',
  description = 'Manage your account settings and preferences',
  footer,
  className,
  ...headlessProps
}: StyledAccountSettingsProps) {
  return (
    <HeadlessAccountSettings
      {...headlessProps}
      render={({
        handleUpdatePreferences,
        handleUpdateVisibility,
        preferences,
        visibility,
        setPreferenceValue,
        setEmailNotificationValue,
        setPushNotificationValue,
        setVisibilityValue,
        isSubmitting,
        errors,
        successMessage,
        availableLanguages,
        availableThemes,
        availableVisibilityLevels
      }) => (
        <Card className={className}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircledIcon className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}
            <Tabs defaultValue="preferences" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="visibility">Visibility</TabsTrigger>
              </TabsList>
              <TabsContent value="preferences" className="space-y-4 pt-4">
                <form onSubmit={handleUpdatePreferences} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(v) => setPreferenceValue('language', v)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguages.map((l) => (
                          <SelectItem key={l.code} value={l.code}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(v) => setPreferenceValue('theme', v)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableThemes.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marketingEmails">Marketing Emails</Label>
                    <Switch
                      id="marketingEmails"
                      checked={preferences.emailNotifications.marketing}
                      onCheckedChange={(v) => setEmailNotificationValue('marketing', v)}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.preferences && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.preferences}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="visibility" className="space-y-4 pt-4">
                <form onSubmit={handleUpdateVisibility} className="space-y-4">
                  {(['email','fullName','profilePicture','companyInfo','lastLogin'] as const).map((field) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field}>{field}</Label>
                      <Select
                        value={visibility[field]}
                        onValueChange={(v) => setVisibilityValue(field, v as any)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id={field}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableVisibilityLevels.map((lvl) => (
                            <SelectItem key={lvl.value} value={lvl.value}>
                              {lvl.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  {errors.visibility && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.visibility}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : 'Save Visibility'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
      )}
    />
  );
}

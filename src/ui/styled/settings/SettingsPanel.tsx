import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Switch } from '@/ui/primitives/switch';
import { Label } from '@/ui/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/primitives/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/primitives/tabs';
import { getPlatformClasses } from '@/hooks/utils/usePlatformStyles';
import { useUserManagement } from '@/lib/auth/UserManagementProvider';

import { ProviderManagementPanel } from '@/ui/styled/auth/ProviderManagementPanel';

export function SettingsPanel() {
  const { t } = useTranslation();
  const {
    theme,
    language,
    notifications,
    privacy,
    setTheme,
    setLanguage,
    updateNotifications,
    updatePrivacy,
  } = useSettingsStore();
  const { platform, isNative } = useUserManagement();

  const containerClasses = getPlatformClasses({
    base: "container mx-auto py-8",
    mobile: "py-4 px-2"
  }, { platform, isNative });

  const cardClasses = getPlatformClasses({
    base: "bg-card rounded-lg shadow",
    mobile: "rounded-md"
  }, { platform, isNative });


  return (
    <div className={containerClasses}>
      <Card className={cardClasses}>
        <CardHeader>
          <CardTitle>{t('settings.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
              <TabsTrigger value="notifications">{t('settings.notifications')}</TabsTrigger>
              <TabsTrigger value="privacy">{t('settings.privacy')}</TabsTrigger>
              <TabsTrigger value="accounts">{t('settings.accounts')}</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('settings.language')}</Label>
                  <Select
                    value={language}
                    onValueChange={(value: string) => setLanguage(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('settings.theme')}</Label>
                  <Select
                    value={theme}
                    onValueChange={(value: 'light' | 'dark' | 'system') =>
                      setTheme(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
                      <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
                      <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.preferences.emailNotifications')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.preferences.emailNotificationsDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked: boolean) =>
                      updateNotifications({ email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.preferences.pushNotifications')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.preferences.pushNotificationsDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked: boolean) =>
                      updateNotifications({ push: checked })
                    }
                  />
                </div>

                {(platform === 'ios' || platform === 'android') && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.preferences.mobileNotifications')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.preferences.mobileNotificationsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.mobile ?? true}
                      onCheckedChange={(checked: boolean) =>
                        updateNotifications({ mobile: checked })
                      }
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.preferences.marketingEmails')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.preferences.marketingEmailsDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing ?? false}
                    onCheckedChange={(checked: boolean) =>
                      updateNotifications({ marketing: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('settings.preferences.profileVisibility')}</Label>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={(value: 'public' | 'private' | 'friends') =>
                      updatePrivacy({ profileVisibility: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{t('settings.privacy.public')}</SelectItem>
                      <SelectItem value="private">{t('settings.privacy.private')}</SelectItem>
                      <SelectItem value="friends">{t('settings.privacy.friends')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.preferences.showOnlineStatus')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.preferences.showOnlineStatusDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showOnlineStatus ?? false}
                    onCheckedChange={(checked: boolean) =>
                      updatePrivacy({ showOnlineStatus: checked })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            {/* Connected Accounts */}
            <TabsContent value="accounts">
              <ProviderManagementPanel />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 
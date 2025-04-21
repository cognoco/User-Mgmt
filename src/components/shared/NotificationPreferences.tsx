'use client';

// src/components/shared/NotificationPreferences.tsx
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '@/lib/stores/preferences.store';
import type { UserPreferences } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Smartphone, BadgePercent } from 'lucide-react';
import { useUserManagement } from '@/lib/auth/UserManagementProvider';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationPreferencesProps {
  variant?: 'settings' | 'profile';
  showHeader?: boolean;
  className?: string;
  useCard?: boolean;
}

export function NotificationPreferences({
  variant = 'settings',
  showHeader = true,
  className = '',
  useCard = true
}: NotificationPreferencesProps) {
  const { t } = useTranslation();
  const { platform } = useUserManagement();
  const { preferences, isLoading, error, fetchPreferences, updatePreferences } = usePreferencesStore();

  useEffect(() => {
      if (!preferences && !isLoading && !error) {
          fetchPreferences();
      }
  }, [preferences, isLoading, error, fetchPreferences]);

  if (isLoading && !preferences) {
    return (
        <div className="space-y-6 p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
        </div>
    );
  }

  if (error && !preferences) {
      console.error("Error loading notification preferences:", error);
      return <p className="text-destructive text-sm p-4">Error loading preferences.</p>;
  }

  const defaultNotifications = { 
      email: true, 
      push: true, 
      marketing: false 
  };

  const currentNotifications = preferences?.notifications ?? defaultNotifications;

  const handlePreferenceChange = (key: keyof UserPreferences['notifications'], value: boolean) => {
      const existingNotifications = preferences?.notifications ?? defaultNotifications;
      updatePreferences({ 
          notifications: { 
              ...existingNotifications,
              [key]: value 
          }
      });
  };

  const notifications = [
    {
      id: 'email',
      name: t('settings.preferences.emailNotifications'),
      description: t('settings.preferences.emailNotificationsDesc'),
      icon: Mail,
      enabled: currentNotifications.email,
      onChange: (checked: boolean) => handlePreferenceChange('email', checked),
      platforms: ['web', 'ios', 'android', 'react-native']
    },
    {
      id: 'push',
      name: platform === 'web' 
        ? t('settings.preferences.pushNotifications') 
        : t('settings.preferences.mobileNotifications'),
      description: platform === 'web'
        ? t('settings.preferences.pushNotificationsDesc')
        : t('settings.preferences.mobileNotificationsDesc'),
      icon: platform === 'web' ? Bell : Smartphone,
      enabled: currentNotifications.push,
      onChange: (checked: boolean) => handlePreferenceChange('push', checked),
      platforms: ['web', 'ios', 'android', 'react-native']
    },
    {
      id: 'marketing',
      name: t('settings.preferences.marketingEmails', 'Marketing Communications'),
      description: t('settings.preferences.marketingEmailsDesc', 'Receive occasional updates about new features and offers.'),
      icon: BadgePercent,
      enabled: currentNotifications.marketing,
      onChange: (checked: boolean) => handlePreferenceChange('marketing', checked),
      platforms: ['web', 'ios', 'android', 'react-native']
    },
  ].filter(notification => 
    notification.platforms.includes(platform)
  );

  if (notifications.length === 0 && !isLoading) { 
    return null;
  }

  const notificationContent = (
    <div className={`space-y-6 ${className}`}>
      {isLoading && notifications.length > 0 && (
           <div className="space-y-6">
               <Skeleton className="h-6 w-3/4" />
               <Skeleton className="h-6 w-1/2" />
               <Skeleton className="h-6 w-3/4" />
           </div>
      )}
      {!isLoading && notifications.map((notification) => (
        <div
          key={notification.id}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <notification.icon className="h-5 w-5 text-primary" />
            <div>
              <Label htmlFor={notification.id} className="font-medium">
                {notification.name}
              </Label>
              <p className="text-sm text-muted-foreground">
                {notification.description}
              </p>
            </div>
          </div>
          <Switch
            id={notification.id}
            checked={notification.enabled}
            onCheckedChange={notification.onChange}
            disabled={isLoading || !preferences}
          />
        </div>
      ))}
    </div>
  );

  if (variant === 'profile' && !useCard) {
    return notificationContent;
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle>{t('settings.notifications.title', 'Notifications')}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {notificationContent}
      </CardContent>
    </Card>
  );
}

'use client';
import '@/lib/i18n';

import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/settings/LanguageSelector';
import { NotificationPreferences } from '@/components/shared/NotificationPreferences';
import { DataExport } from '@/components/gdpr/DataExport';
import { AccountDeletion } from '@/components/gdpr/AccountDeletion';
import Link from 'next/link';
import { useProfileStore } from '@/lib/stores/profile.store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SettingsPage() {
  const { t } = useTranslation();
  const profile = useProfileStore(state => state.profile);
  const isLoading = useProfileStore(state => state.isLoading);
  const error = useProfileStore(state => state.error);
  const fetchProfile = useProfileStore(state => state.fetchProfile);

  useEffect(() => {
    if (!profile && !isLoading && !error) {
      fetchProfile();
    }
    // Show toast if redirected from OAuth linking
    if (typeof window !== 'undefined' && sessionStorage.getItem('show_oauth_linked_toast')) {
      toast({
        title: 'Provider linked!',
        description: 'Your login provider was successfully linked to your account.',
      });
      sessionStorage.removeItem('show_oauth_linked_toast');
    }
  }, [profile, isLoading, error, fetchProfile]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    console.log("Theme change requested (handler needs implementation with preferences store):", newTheme);
  };

  if (isLoading && !profile) {
    return (
      <div className="container mx-auto py-8 space-y-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6"><Skeleton className="h-8 w-32" /></h1>
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto py-8 max-w-3xl">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Settings</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{t('settings.title', 'Settings')}</h1>
      
      <section className="space-y-4 p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold border-b pb-2">{t('settings.language', 'Language')}</h2>
        <LanguageSelector />
      </section>

      <section className="space-y-4 p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold border-b pb-2">{t('settings.theme', 'Appearance')}</h2>
        <div className="space-y-2 pt-2">
          <Label htmlFor="theme-select">{t('settings.theme', 'Theme')}</Label>
          <Select
            defaultValue="system"
            onValueChange={handleThemeChange}
            disabled={true}
          >
            <SelectTrigger id="theme-select" className="w-[200px]">
              <SelectValue placeholder={t('settings.selectTheme', 'Select Theme')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Theme selection coming soon.</p>
        </div>
      </section>

      <section className="p-6 border rounded-lg bg-card">
         <h2 className="text-xl font-semibold border-b pb-2 mb-4">{t('settings.notifications.title', 'Notifications')}</h2>
         <NotificationPreferences />
      </section>

      <section className="space-y-6 p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold border-b pb-2 mb-4">{t('settings.privacy', 'Data & Privacy')}</h2>
        <DataExport />
        <AccountDeletion />
        
        <div className="pt-4 text-center">
             <Link 
                href="/docs/PRIVACY_POLICY.md"
                className="text-sm text-muted-foreground underline hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
             >
               {t('settings.privacyPolicyLink', 'View Privacy Policy')}
             </Link>
         </div>
      </section>
    </div>
  );
} 
/**
 * Headless Settings Panel
 *
 * Provides settings data and update handlers via render props.
 */
import { useSettingsStore } from '@/lib/stores/settings.store';

export interface SettingsPanelProps {
  render: (props: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      marketing?: boolean;
      mobile?: boolean;
    };
    privacy: {
      showProfile: boolean;
      showActivity: boolean;
      profileVisibility?: 'public' | 'private' | 'friends';
      showOnlineStatus?: boolean;
    };
    setTheme: (t: 'light' | 'dark' | 'system') => void;
    setLanguage: (l: string) => void;
    updateNotifications: (n: Partial<{ email: boolean; push: boolean; sms: boolean; marketing?: boolean; mobile?: boolean }>) => void;
    updatePrivacy: (p: Partial<{ showProfile: boolean; showActivity: boolean; profileVisibility?: 'public' | 'private' | 'friends'; showOnlineStatus?: boolean }>) => void;
  }) => React.ReactNode;
}

export function SettingsPanel({ render }: SettingsPanelProps) {
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

  return (
    <>
      {render({
        theme,
        language,
        notifications,
        privacy,
        setTheme,
        setLanguage,
        updateNotifications,
        updatePrivacy,
      })}
    </>
  );
}

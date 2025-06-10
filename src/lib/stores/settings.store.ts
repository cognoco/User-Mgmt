import { create } from 'zustand';

interface SettingsState {
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
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: string) => void;
  updateNotifications: (notifications: Partial<SettingsState['notifications']>) => void;
  updatePrivacy: (privacy: Partial<SettingsState['privacy']>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sms: false,
    marketing: false,
    mobile: true,
  },
  privacy: {
    showProfile: true,
    showActivity: false,
    profileVisibility: 'public',
    showOnlineStatus: true,
  },
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  updateNotifications: (notifications) =>
    set((state) => ({
      notifications: { ...state.notifications, ...notifications },
    })),
  updatePrivacy: (privacy) =>
    set((state) => ({
      privacy: { ...state.privacy, ...privacy },
    })),
}));
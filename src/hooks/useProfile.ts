import { create } from 'zustand';
import { api } from '@/lib/api/axios';
import { useProfileStore } from '@/lib/stores/profile.store';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  phoneNumber?: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacySettings: {
    profileVisibility: 'public' | 'private' | 'contacts';
    showEmail: boolean;
    showPhone: boolean;
  };
  connectedAccounts: {
    google?: boolean;
    github?: boolean;
    twitter?: boolean;
  };
}

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  toggleTwoFactor: () => Promise<void>;
  updatePrivacySettings: (settings: Profile['privacySettings']) => Promise<void>;
  updateNotificationPreferences: (prefs: Profile['notificationPreferences']) => Promise<void>;
  connectAccount: (provider: keyof Profile['connectedAccounts']) => Promise<void>;
  disconnectAccount: (provider: keyof Profile['connectedAccounts']) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useProfile = () => {
  const profile = useProfileStore((state) => state.profile);
  const isLoading = useProfileStore((state) => state.isLoading);
  const updatePrivacySettings = useProfileStore((state) => state.updatePrivacySettings);

  // You could add more selectors here if needed, e.g., specific parts of the profile
  // const avatarUrl = useProfileStore((state) => state.profile?.avatarUrl);

  return {
    profile,
    isLoading,
    updatePrivacySettings,
    // Add other selected state/actions here if needed
  };
};
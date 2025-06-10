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


export const useProfile = () => {
  const { profile, isLoading } = useProfileStore();

  // You could add more selectors here if needed, e.g., specific parts of the profile
  // const avatarUrl = useProfileStore((state) => state.profile?.avatarUrl);

  return {
    profile,
    isLoading,
  };
};
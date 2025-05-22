import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/user/useProfile';

export interface PrivacySettingsProps {
  /** Automatically save changes when toggled */
  autoSave?: boolean;
  /** Render prop for custom UI */
  render: (props: {
    visibility: 'public' | 'private' | 'contacts';
    setVisibility: (v: 'public' | 'private' | 'contacts') => void;
    showEmail: boolean;
    toggleShowEmail: () => void;
    showPhone: boolean;
    toggleShowPhone: () => void;
    isLoading: boolean;
    error: string | null;
    save: () => Promise<void>;
  }) => React.ReactNode;
}

/**
 * Headless component for managing privacy settings
 */
export function PrivacySettings({ autoSave = true, render }: PrivacySettingsProps) {
  const { profile, updatePrivacySettings, isLoading } = useProfile();
  const [visibility, setVisibility] = useState<'public' | 'private' | 'contacts'>('private');
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setVisibility(profile.privacySettings.profileVisibility);
      setShowEmail(profile.privacySettings.showEmail);
      setShowPhone(profile.privacySettings.showPhone);
    }
  }, [profile]);

  const save = async () => {
    if (!profile) return;
    setError(null);
    try {
      await updatePrivacySettings({
        profileVisibility: visibility,
        showEmail,
        showPhone
      });
    } catch (err: any) {
      setError(err.message || 'Failed to update privacy settings');
    }
  };

  const setVis = (v: 'public' | 'private' | 'contacts') => {
    setVisibility(v);
    if (autoSave) save();
  };
  const toggleEmail = () => {
    setShowEmail(v => !v);
    if (autoSave) save();
  };
  const togglePhone = () => {
    setShowPhone(v => !v);
    if (autoSave) save();
  };

  return (
    <>{render({
      visibility,
      setVisibility: setVis,
      showEmail,
      toggleShowEmail: toggleEmail,
      showPhone,
      toggleShowPhone: togglePhone,
      isLoading,
      error,
      save
    })}</>
  );
}

export default PrivacySettings;

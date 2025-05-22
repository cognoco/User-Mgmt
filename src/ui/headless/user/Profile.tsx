import React, { useState, useCallback } from 'react';
import { useUserProfile } from '@/hooks/user/useUserProfile';
import { UserProfile, ProfileUpdatePayload } from '@/core/user/models';

export interface ProfileRenderProps {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  uploadingAvatar: boolean;
  updateProfile: (profileData: ProfileUpdatePayload) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  updateProfileField: (field: string, value: string) => void;
  clearMessages: () => void;
}

export interface ProfileProps {
  userId?: string;
  children: (props: ProfileRenderProps) => React.ReactNode;
}

/**
 * Headless Profile component that contains all the business logic for user profile management
 * Follows the render props pattern to allow for custom UI implementation
 */
export default function Profile({ userId, children }: ProfileProps) {
  const {
    profile,
    isLoading,
    error,
    successMessage,
    fetchUserProfile,
    updateProfile: updateUserProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    clearMessages
  } = useUserProfile();

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Update a single profile field
  const updateProfileField = useCallback((field: string, value: string) => {
    if (profile) {
      const updatedProfile = { ...profile, [field]: value };
      // This only updates the local state, not the database
      // The actual update happens when updateProfile is called
    }
  }, [profile]);

  // Update the profile in the database
  const updateProfile = useCallback(async (profileData: ProfileUpdatePayload) => {
    if (!userId && !profile?.id) return;
    const id = userId || profile?.id as string;
    await updateUserProfile(id, profileData);
  }, [userId, profile, updateUserProfile]);

  // Upload avatar
  const uploadAvatar = useCallback(async (file: File) => {
    if (!userId && !profile?.id) return;
    const id = userId || profile?.id as string;
    
    setUploadingAvatar(true);
    try {
      await uploadProfilePicture(id, file);
    } finally {
      setUploadingAvatar(false);
    }
  }, [userId, profile, uploadProfilePicture]);

  // Delete avatar
  const deleteAvatar = useCallback(async () => {
    if (!userId && !profile?.id) return;
    const id = userId || profile?.id as string;
    
    await deleteProfilePicture(id);
  }, [userId, profile, deleteProfilePicture]);

  return children({
    profile,
    isLoading,
    error,
    successMessage,
    uploadingAvatar,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    updateProfileField,
    clearMessages
  });
}

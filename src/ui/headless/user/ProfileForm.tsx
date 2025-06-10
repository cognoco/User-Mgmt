import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProfileStore } from '@/lib/stores/profile.store';
import { useAuth } from '@/hooks/auth/useAuth';
import { profileSchema, ProfileFormData } from '@/types/profile';
import { api } from '@/lib/api/axios';
import { z } from 'zod';

export interface ProfileFormRenderProps {
  profile: any | null;
  isLoading: boolean;
  isPrivacyLoading: boolean;
  isEditing: boolean;
  errors: Record<string, any>;
  isDirty: boolean;
  register: ReturnType<typeof useForm>['register'];
  watch: ReturnType<typeof useForm>['watch'];
  handleSubmit: (onSubmit: (data: ProfileFormData) => Promise<void>) => (e: React.FormEvent) => void;
  handleEditToggle: () => void;
  handlePrivacyChange: (checked: boolean) => Promise<void>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  userEmail: string | undefined;
}

export interface ProfileFormProps {
  children: (props: ProfileFormRenderProps) => React.ReactNode;
}

/**
 * Headless ProfileForm component that contains all the business logic for profile form management
 * Follows the render props pattern to allow for custom UI implementation
 */
export default function ProfileForm({ children }: ProfileFormProps) {
  const profileStore = useProfileStore();
  const { profile, isLoading: isProfileLoading, fetchProfile, updateProfile } = profileStore;
  
  const userEmail = useAuth().user?.email;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isPrivacyLoading, setIsPrivacyLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<
    z.input<typeof profileSchema> & { is_public?: boolean },
    any,
    z.output<typeof profileSchema> & { is_public?: boolean }
  >({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        bio: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        phone_number: '',
        website: '',
        is_public: true,
    }
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      reset({
        bio: profile.bio ?? '',
        gender: profile.gender ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
        state: profile.state ?? '',
        country: profile.country ?? '',
        postal_code: profile.postal_code ?? '',
        phone_number: profile.phone_number ?? '',
        website: profile.website ?? '',
        is_public: profile.is_public ?? true,
      });
    }
  }, [profile, reset, isEditing]);

  const handleEditToggle = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);

  const onSubmit = useCallback(async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      if (!profileStore.error) {
        setIsEditing(false);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error updating profile:", error);
      }
    }
  }, [updateProfile, profileStore.error]);

  const handlePrivacyChange = useCallback(async (checked: boolean) => {
    setIsPrivacyLoading(true);
    try {
      const response = await api.put('/api/profile/privacy', { is_public: checked });
      setValue('is_public', response.data.is_public, { shouldDirty: false });
      useProfileStore.setState(state => ({
        profile: state.profile ? { ...state.profile, is_public: response.data.is_public } : null
      }));
      // Toast notification will be handled by the styled component
      return response.data;
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') { 
        console.error("Privacy update error:", err);
      }
      throw err;
    } finally {
      setIsPrivacyLoading(false);
    }
  }, [setValue]);

  return children({
    profile,
    isLoading: isProfileLoading,
    isPrivacyLoading,
    isEditing,
    errors,
    isDirty,
    register,
    watch,
    handleSubmit: (onSubmitFn) => handleSubmit(onSubmitFn),
    handleEditToggle,
    handlePrivacyChange,
    onSubmit,
    userEmail
  });
}

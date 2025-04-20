'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useProfileStore } from '@/lib/stores/profile';
import { useAuthStore, AuthState } from '@/lib/stores/auth.store';
import { profileSchema, ProfileFormData } from '@/types/profile';
import { Edit2 } from 'lucide-react';
import { api } from '@/lib/api/axios';

const ProfileDisplayField = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
        <div className="mb-4">
            <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
            <p className="text-base mt-1">{value}</p>
        </div>
    );
};

export function ProfileForm() {
  const { toast } = useToast();
  const { profile, isLoading: isProfileLoading, error: profileError, fetchProfile, updateProfile } = useProfileStore();
  const userEmail = useAuthStore((state: AuthState) => state.user?.email);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isPrivacyLoading, setIsPrivacyLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData & { is_public?: boolean }>({
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

  const handleEditToggle = () => {
      setIsEditing(!isEditing);
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      if (!useProfileStore.getState().error) { 
          setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handlePrivacyChange = async (checked: boolean) => {
      setIsPrivacyLoading(true);
      try {
          const response = await api.put('/api/profile/privacy', { is_public: checked });
          setValue('is_public', response.data.is_public, { shouldDirty: false });
          useProfileStore.setState(state => ({
              profile: state.profile ? { ...state.profile, is_public: response.data.is_public } : null
          }));
          toast({ title: "Success", description: response.data.message });
      } catch (err: any) {
          console.error("Privacy update error:", err);
          const errorMsg = err.response?.data?.error || "Failed to update visibility.";
          toast({ title: "Error", description: errorMsg, variant: "destructive" });
          setValue('is_public', !checked, { shouldDirty: false });
      } finally {
          setIsPrivacyLoading(false);
      }
  };

  const isLoading = isProfileLoading || isPrivacyLoading;

  if (isProfileLoading && !profile && !profileError) {
    return <div className="text-center p-4">Loading profile...</div>;
  }
  if (profileError && !profile) {
      return <Alert variant="destructive"><AlertDescription>{profileError}</AlertDescription></Alert>;
  }
  if (!profile) {
      return <div className="text-center p-4">Could not load profile.</div>;
  }

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Name not set';

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            {!isEditing && (
                <Button variant="outline" size="sm" onClick={handleEditToggle} aria-label="Edit Profile">
                   <Edit2 className="mr-2 h-4 w-4" /> Edit
                </Button>
            )}
       </div>

      {isEditing && profileError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Update Failed</AlertTitle>
          <AlertDescription>{profileError}</AlertDescription>
        </Alert>
      )}

      {!isEditing && (
          <div className="space-y-3">
              <ProfileDisplayField label="Name" value={displayName} />
              <ProfileDisplayField label="Email" value={userEmail} /> 
              <ProfileDisplayField label="Bio" value={profile.bio} />
              <ProfileDisplayField label="Phone Number" value={profile.phone_number} />
              <ProfileDisplayField label="Gender" value={profile.gender} /> 
              <ProfileDisplayField 
                  label="Address" 
                  value={[profile.address, profile.city, profile.state, profile.postal_code, profile.country].filter(Boolean).join(', ')}
              />
              <ProfileDisplayField label="Website" value={profile.website} />
              <div>
                    <Label className="text-sm font-medium text-muted-foreground">Profile Visibility</Label>
                    <p className={`text-base mt-1 ${profile.is_public ? 'text-green-600' : 'text-amber-600'}`}>
                        {profile.is_public ? 'Public' : 'Private'}
                    </p>
               </div>
          </div>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <div className="mb-4">
                <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                <p className="text-base mt-1">{displayName}</p>
             </div>
             <div className="mb-4">
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-base mt-1">{userEmail || '-'}</p>
             </div>
             
            <div className="space-y-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" {...register('bio')} disabled={isLoading} rows={3} />
                {errors.bio && <p className="text-destructive text-sm mt-1">{errors.bio.message}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input 
                  id="phone_number" 
                  type="tel" 
                  inputMode="numeric"
                  pattern="[0-9]*"
                  {...register('phone_number')} 
                  disabled={isLoading} 
                />
                {errors.phone_number && <p className="text-destructive text-sm mt-1">{errors.phone_number.message}</p>}
            </div>
            
            <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" {...register('gender')} disabled={isLoading} />
                {errors.gender && <p className="text-destructive text-sm mt-1">{errors.gender.message}</p>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" {...register('address')} disabled={isLoading} />
                    {errors.address && <p className="text-destructive text-sm mt-1">{errors.address.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" {...register('city')} disabled={isLoading} />
                    {errors.city && <p className="text-destructive text-sm mt-1">{errors.city.message}</p>}
                </div>
                 <div className="space-y-1.5">
                    <Label htmlFor="state">State / Province</Label>
                    <Input id="state" {...register('state')} disabled={isLoading} />
                    {errors.state && <p className="text-destructive text-sm mt-1">{errors.state.message}</p>}
                </div>
                 <div className="space-y-1.5">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input id="postal_code" {...register('postal_code')} disabled={isLoading} />
                    {errors.postal_code && <p className="text-destructive text-sm mt-1">{errors.postal_code.message}</p>}
                </div>
                 <div className="space-y-1.5 col-span-full sm:col-span-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" {...register('country')} disabled={isLoading} />
                    {errors.country && <p className="text-destructive text-sm mt-1">{errors.country.message}</p>}
                </div>
            </div>
            
            <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" {...register('website')} placeholder="https://example.com" disabled={isLoading} />
                {errors.website && <p className="text-destructive text-sm mt-1">{errors.website.message}</p>}
            </div>

            <div className="flex items-center justify-between space-x-2 pt-4 border-t mt-4">
                <div>
                    <Label htmlFor="is_public" className="font-medium">Make Profile Public</Label>
                     <p className="text-sm text-muted-foreground">Allow others to view your profile details.</p>
                </div>
                <Switch 
                    id="is_public" 
                    checked={watch('is_public') ?? true}
                    onCheckedChange={handlePrivacyChange}
                    disabled={isLoading} 
                    aria-label="Make profile public"
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <Button variant="outline" type="button" onClick={handleEditToggle} disabled={isLoading}> 
                    <XCircle className="mr-2 h-4 w-4" /> Cancel Edit
                </Button>
                <Button type="submit" disabled={isLoading || !isDirty}> 
                     <Save className="mr-2 h-4 w-4" /> {isProfileLoading ? 'Saving...' : 'Save Profile Changes'}
                </Button>
            </div>
        </form>
      )}
    </div>
  );
} 
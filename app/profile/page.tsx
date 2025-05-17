'use client'; // Required for hooks
import '@/lib/i18n';

import { useEffect } from 'react';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { AccountDeletion } from '@/components/account/AccountDeletion';
import { CorporateProfileSection } from '@/components/profile/CorporateProfileSection';
import { useTranslation } from 'react-i18next';
import { getPlatformClasses } from '@/hooks/usePlatformStyles'; // Corrected path
import { useUserManagement } from '@/lib/auth/UserManagementProvider'; // Corrected path
import { useProfileStore } from '@/lib/stores/profile.store'; // Use updated store
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserType } from '@/types/user-type'; // Corrected path

export default function ProfilePage() {
  const { t } = useTranslation();
  const { 
    profile, 
    isLoading, 
    error, 
    fetchProfile, 
    updateBusinessProfile // Get the new action
  } = useProfileStore();

  const { platform, isNative } = useUserManagement();

  useEffect(() => {
    // Fetch profile if not already loaded or loading
    if (!profile && !isLoading && !error) {
      fetchProfile();
    }
  }, [profile, isLoading, error, fetchProfile]);

  // TODO: Implement route protection - redirect if not authenticated

  // Keeping platform classes for now, review usePlatformStyles hook if needed
  const containerClasses = getPlatformClasses({
    base: "container mx-auto py-8",
    mobile: "py-4 px-2"
  }, { platform, isNative });

  const contentClasses = getPlatformClasses({
    base: "max-w-2xl mx-auto space-y-8",
    mobile: "w-full space-y-6"
  }, { platform, isNative });

  const cardClasses = getPlatformClasses({
    base: "bg-card rounded-lg shadow p-6",
    mobile: "p-4 rounded-md"
  }, { platform, isNative });

  // Show loading skeleton
  if (isLoading && !profile) {
    return (
      <div className={containerClasses}>
        <div className={contentClasses}>
          <h1 className="text-2xl font-bold"><Skeleton className="h-8 w-48" /></h1>
          <Skeleton className={`${cardClasses} h-32`} />
          <Skeleton className={`${cardClasses} h-64`} />
          {/* Add skeleton for potential Corporate section */}
          <Skeleton className={`${cardClasses} h-96`} /> 
          <Skeleton className={`${cardClasses} h-48`} />
          <Skeleton className={`${cardClasses} h-48`} />
        </div>
      </div>
    );
  }

  // Show error message
  if (error && !profile) {
     return (
      <div className={containerClasses}>
        <div className={contentClasses}>
           <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        </div>
      </div>
    );
  }
  
  // Ensure profile is loaded before rendering sections
  if (!profile) {
      return null; // Or a specific "No profile data" message
  }

  // Extract company data for the corporate section prop
  const companyData = {
      name: profile.companyName || '',
      size: profile.companySize === null ? undefined : profile.companySize,
      industry: profile.industry || '',
      website: profile.companyWebsite || '', 
      position: profile.position || '',
      department: profile.department || '',
      vatId: profile.vatId || '',
      address: profile.address === null ? undefined : profile.address,
  };

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        <h1 className="text-2xl font-bold">{t('profile.title', 'Manage Your Profile')}</h1>
        
        <div className={cardClasses}>
          <h2 className="text-lg font-semibold mb-4">{t('profile.avatar.title', 'Profile Picture')}</h2>
          <AvatarUpload />
        </div>
        
        <div className={cardClasses}>
          <h2 className="text-lg font-semibold mb-4">{t('profile.details.title', 'Profile Details')}</h2>
          <ProfileForm />
        </div>

        {/* Conditionally render CorporateProfileSection */}
        {profile.userType === UserType.CORPORATE && (
          <CorporateProfileSection 
            userType={UserType.CORPORATE} 
            company={companyData} 
            onUpdate={updateBusinessProfile}
            isLoading={isLoading}
            error={error}
          />
        )}

        <div className={cardClasses}>
          <h2 className="text-lg font-semibold mb-4">{t('profile.changePassword.title', 'Change Password')}</h2>
          <ChangePasswordForm />
        </div>
        
         <div className={`${cardClasses} border border-destructive/50 bg-destructive/5`}> {/* Emphasize danger */} 
           <h2 className="text-lg font-semibold mb-4 text-destructive">{t('profile.deleteAccount.title', 'Delete Account')}</h2>
           <AccountDeletion />
         </div>

      </div>
    </div>
  );
} 
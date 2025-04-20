'use client';

import { useEffect } from 'react';
import { CompanyProfileForm } from '@/components/company/CompanyProfileForm';
import { useCompanyProfileStore } from '@/lib/stores/companyProfileStore';
import { DomainVerification } from '@/components/company/DomainVerification';
import { CompanyProfile } from '@/types/company';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompanyProfilePage() {
  const { profile, isLoading, error, fetchProfile, updateProfile } = useCompanyProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSubmit = async (data: Partial<CompanyProfile>) => {
    await updateProfile(data);
    fetchProfile();
  };

  const handleVerificationChange = () => {
    fetchProfile();
  };

  if (error && !isLoading) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error instanceof Error ? error.message : String(error)}
        </AlertDescription>
      </Alert>
    );
  }

  const relevantProfileData = profile ? {
    id: profile.id,
    domain_name: profile.domain_name,
    domain_verified: profile.domain_verified,
    domain_verification_token: profile.domain_verification_token,
    website: profile.website
  } : null;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && !profile ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <CompanyProfileForm
              initialData={profile ? { 
                  ...profile, 
                  address: profile.address ? {
                      street_line1: profile.address.street_line1 || '',
                      street_line2: profile.address.street_line2 || '',
                      city: profile.address.city || '',
                      state: profile.address.state || '',
                      postal_code: profile.address.postal_code || '',
                      country: profile.address.country || '',
                  } : undefined 
              } : undefined}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>

      {profile && (
        <DomainVerification 
          profile={relevantProfileData} 
          onVerificationChange={handleVerificationChange} 
        />
      )}
      {(isLoading && !profile) && (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 
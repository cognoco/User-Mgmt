'use client';

import { useEffect } from 'react';
import { CompanyProfileForm } from '@/ui/styled/company/CompanyProfileForm';
import { useCompanyProfileStore } from '@/lib/stores/companyProfileStore';
import { DomainManagement } from '@/ui/styled/company/DomainManagement';
import { CompanyNotificationPreferences } from '@/ui/styled/company/NotificationPreferences';
import { CompanyProfile } from '@/types/company';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        <Tabs defaultValue="domains" className="space-y-6">
          <TabsList>
            <TabsTrigger value="domains">Domain Management</TabsTrigger>
            <TabsTrigger value="notifications">Notification Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="domains" className="space-y-4">
            <DomainManagement 
              companyId={profile.id} 
              website={profile.website}
              onVerificationChange={handleVerificationChange} 
            />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <CompanyNotificationPreferences
              companyId={profile.id}
            />
          </TabsContent>
        </Tabs>
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
import React from 'react';
import { notFound } from 'next/navigation';
import OrganizationSSO from '@/components/auth/OrganizationSSO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SSOSettingsPageProps {
  params: {
    orgId: string;
  };
}

export default function SSOSettingsPage({ params }: SSOSettingsPageProps) {
  const { orgId } = params;

  if (!orgId) {
    return notFound();
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Organization SSO Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Single Sign-On Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationSSO orgId={orgId} />
        </CardContent>
      </Card>
    </div>
  );
} 
'use client';

import { Metadata } from 'next';
import { DataExportRequest } from '@/ui/styled/gdpr/DataExportRequest';
import { DataDeletionRequest } from '@/ui/styled/gdpr/DataDeletionRequest';
import { ConsentManagement } from '@/ui/styled/gdpr/ConsentManagement';

export const metadata: Metadata = {
  title: 'GDPR Compliance',
  description: 'Process export and deletion requests and manage user consent',
};

export default function AdminGdprCompliancePage() {
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold">GDPR Compliance</h1>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Data Export</h2>
        <DataExportRequest />
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Data Deletion</h2>
        <DataDeletionRequest />
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Consent Management</h2>
        <ConsentManagement />
      </div>
    </div>
  );
}

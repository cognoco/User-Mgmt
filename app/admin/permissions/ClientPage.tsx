'use client';

import { Skeleton } from '@/ui/primitives/skeleton';
import { Alert, AlertDescription } from '@/ui/primitives/alert';

import type React from 'react';
import { PermissionEditor } from '@/ui/styled/permission/PermissionEditor';
import { usePermissions } from '@/hooks/permission/usePermissions';

export default function PermissionsManagementPageClient(): React.JSX.Element {
  const { isLoading, error } = usePermissions();

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
        <p className="text-muted-foreground">
          Create, edit, and manage permissions for your application
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive" className="my-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <PermissionEditor />
      )}
    </div>
  );
}

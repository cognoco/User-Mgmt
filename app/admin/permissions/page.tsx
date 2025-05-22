'use client';

import { Metadata } from 'next';
import { Skeleton } from '@/ui/primitives/skeleton';
import { Alert, AlertDescription } from '@/ui/primitives/alert';

// Import from our new architecture
import { PermissionEditor } from '@/ui/styled/permission/permission-editor';
import { usePermissions } from '@/hooks/permission/use-permissions';

export const metadata: Metadata = {
  title: 'Permission Management',
  description: 'Create and manage permissions for your application',
};

export default function PermissionsManagementPage() {
  // Use our hooks from the new architecture
  const {
    permissions,
    permissionCategories,
    isLoading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    createCategory,
    selectedPermission,
    setSelectedPermission
  } = usePermissions();

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
        <PermissionEditor
          permissions={permissions}
          categories={permissionCategories}
          selectedPermission={selectedPermission}
          setSelectedPermission={setSelectedPermission}
          onCreatePermission={createPermission}
          onUpdatePermission={updatePermission}
          onDeletePermission={deletePermission}
          onCreateCategory={createCategory}
        />
      )}
    </div>
  );
}

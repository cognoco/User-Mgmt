'use client';

import { useEffect, useState } from 'react';
import { Metadata } from 'next';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import from our new architecture
import { RoleManager } from '@/src/ui/styled/permission/RoleManager';
import { useRoles } from '@/src/hooks/permission/useRoles';
import { usePermissions } from '@/src/hooks/permission/usePermissions';

export const metadata: Metadata = {
  title: 'Role Management',
  description: 'Manage user roles and permissions',
};

export default function RolesManagementPage() {
  // Use our hooks from the new architecture
  const {
    roles,
    isLoading: rolesLoading,
    error: rolesError,
    createRole,
    updateRole,
    deleteRole,
    selectedRole,
    setSelectedRole
  } = useRoles();
  
  const {
    permissions,
    permissionCategories,
    isLoading: permissionsLoading,
    error: permissionsError
  } = usePermissions();
  
  // Combine loading and error states
  const isLoading = rolesLoading || permissionsLoading;
  const error = rolesError || permissionsError;

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground">
          Create, edit, and manage roles and their permissions
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
        <RoleManager
          roles={roles}
          permissions={permissions}
          permissionCategories={permissionCategories}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          onCreateRole={createRole}
          onUpdateRole={updateRole}
          onDeleteRole={deleteRole}
        />
      )}
    </div>
  );
}
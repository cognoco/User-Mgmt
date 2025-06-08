'use client';

import { Skeleton } from '@/ui/primitives/skeleton';
import { Alert, AlertDescription } from '@/ui/primitives/alert';

import { RoleManager } from '@/ui/styled/permission/RoleManager';
import { useRoles } from '@/hooks/team/useRoles';
import { usePermissions } from '@/hooks/permission/usePermissions';
import type { RoleCreationPayload, RoleUpdatePayload } from '@/core/permission/models';

export default function RolesManagementPageClient() {
  const {
    isLoading: rolesLoading,
    error: rolesError,
    createRole,
    updateRole,
    deleteRole
  } = useRoles();

  const {
    isLoading: permissionsLoading,
    error: permissionsError
  } = usePermissions();

  const isLoading = rolesLoading || permissionsLoading;
  const error = rolesError || permissionsError;

  const handleCreateRole = async (roleData: RoleCreationPayload) => {
    await createRole(roleData);
  };

  const handleUpdateRole = async (roleId: string, roleData: RoleUpdatePayload) => {
    await updateRole(roleId, roleData);
  };

  const handleDeleteRole = async (roleId: string) => {
    await deleteRole(roleId);
  };

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground">
          Manage user roles and permissions
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
            onCreateRole={handleCreateRole}
            onUpdateRole={handleUpdateRole}
            onDeleteRole={handleDeleteRole}
          />
      )}
    </div>
  );
}

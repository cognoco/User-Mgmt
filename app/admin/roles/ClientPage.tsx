'use client';

import { Skeleton } from '@/ui/primitives/skeleton';
import { Alert, AlertDescription } from '@/ui/primitives/alert';

import { RoleManager } from '@/ui/styled/permission/RoleManager';
import { useRoles } from '@/hooks/team/useRoles';
import { usePermissions } from '@/hooks/permission/usePermissions';

export default function RolesManagementPageClient() {
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

  const isLoading = rolesLoading || permissionsLoading;
  const error = rolesError || permissionsError;

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
          roles={roles || []}
          permissions={permissions || []}
          permissionCategories={permissionCategories || []}
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          onCreateRole={createRole}
          onUpdateRole={updateRole}
          onDeleteRole={deleteRole}
        />
      )}
    </div>
  );
}

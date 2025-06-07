'use client';
import { useEffect } from 'react';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import RoleManagementPanel from '@/ui/styled/admin/RoleManagementPanel';
import { usePermission } from '@/hooks/permission/usePermissions';
import { PermissionValues } from '@/core/permission/models';

export default function UserRoleAssignmentPanel() {
  const { users, searchUsers } = useAdminUsers();
  const { hasPermission, isLoading } = usePermission({
    required: PermissionValues.MANAGE_ROLES,
  });

  useEffect(() => {
    searchUsers({});
  }, [searchUsers]);
  if (isLoading) {
    return <div className="animate-pulse">Loading permissions...</div>;
  }

  if (!hasPermission) {
    return null;
  }

  return <RoleManagementPanel users={users} />;
}

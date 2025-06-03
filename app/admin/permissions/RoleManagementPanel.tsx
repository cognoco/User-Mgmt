'use client';
import { RoleManager } from '@/ui/styled/permission/RoleManager';
import { usePermission } from '@/hooks/permission/usePermissions';
import { PermissionValues } from '@/core/permission/models';

export default function RoleManagementPanel() {
  const { hasPermission, isLoading } = usePermission({
    required: PermissionValues.MANAGE_ROLES,
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading permissions...</div>;
  }

  if (!hasPermission) {
    return null;
  }

  return <RoleManager />;
}

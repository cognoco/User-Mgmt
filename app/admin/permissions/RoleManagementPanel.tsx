'use client';
import { RoleManager } from '@/ui/styled/permission/RoleManager';
import { usePermission } from '@/hooks/usePermission';
import { PermissionValues } from '@/core/permission/models';
import { Spinner } from '@/ui/primitives/spinner';

export default function RoleManagementPanel() {
  const { hasPermission, isLoading } = usePermission({ required: PermissionValues.MANAGE_ROLES });

  if (isLoading) return <Spinner />;
  if (!hasPermission) return <div>Access denied: insufficient permissions.</div>;

  return <RoleManager />;
}

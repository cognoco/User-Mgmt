'use client';
import { useEffect } from 'react';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import RoleManagementPanel from '@/ui/styled/admin/RoleManagementPanel';
import { User } from '@/types/user';
import { UserType } from '@/types/userType';
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

  // Transform admin users to match expected User type
  const transformedUsers: User[] = users.map(user => ({
    id: user.id,
    email: user.email,
    fullName: `${user.firstName} ${user.lastName}`.trim() || user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.status === 'active',
    isVerified: true, // Assume verified if in admin panel
    userType: UserType.PRIVATE, // Default type
    createdAt: user.createdAt,
    lastLogin: user.lastLoginAt || undefined,
  }));

  return <RoleManagementPanel users={transformedUsers} />;
}

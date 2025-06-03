'use client';
import { useEffect } from 'react';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import RoleManagementPanel from '@/ui/styled/admin/RoleManagementPanel';

export default function UserRoleAssignmentPanel() {
  const { users, searchUsers } = useAdminUsers();

  useEffect(() => {
    searchUsers({});
  }, [searchUsers]);

  return <RoleManagementPanel users={users} />;
}

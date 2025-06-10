import { useState, useCallback, useEffect } from 'react';
import { useAdminUsers } from '@/hooks/admin/useAdminUsers';
import { useRoles } from '@/hooks/team/useRoles';
import { Permission } from '@/core/permission/models';
import { PermissionService } from '@/core/permission/interfaces';
import { UserManagementConfiguration } from '@/core/config';

export interface UserRoleAssignerProps {
  onUserSelect?: (id: string) => void;
  render: (props: {
    users: any[];
    roles: any[];
    search: (q: string) => Promise<void>;
    selectUser: (id: string) => void;
    selectedUserId: string | null;
    assign: (roleId: string, expiresAt?: Date) => Promise<void>;
    remove: (roleId: string) => Promise<void>;
    effectivePermissions: Permission[];
    isLoading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

export function UserRoleAssigner({ onUserSelect, render }: UserRoleAssignerProps) {
  const { users, searchUsers, isLoading: searching, error } = useAdminUsers();
  const {
    roles,
    assignRoleToUser,
    removeRoleFromUser,
    getUserRoles,
    isLoading,
  } = useRoles();
  const permissionService = UserManagementConfiguration.getServiceProvider<PermissionService>('permissionService');

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [effective, setEffective] = useState<Permission[]>([]);

  const selectUser = useCallback((id: string) => {
    setSelectedUserId(id);
    onUserSelect?.(id);
  }, [onUserSelect]);

  const loadEffective = useCallback(async (userId: string) => {
    if (!permissionService) return [] as Permission[];
    const perms = await permissionService.getUserResourcePermissions(userId);
    setEffective(perms.map(p => p.permission));
  }, [permissionService]);

  useEffect(() => {
    if (selectedUserId) loadEffective(selectedUserId);
  }, [selectedUserId, loadEffective]);

  const assign = useCallback(async (roleId: string, expiresAt?: Date) => {
    if (!selectedUserId) return;
    await assignRoleToUser(selectedUserId, roleId, 'self', expiresAt);
    await loadEffective(selectedUserId);
  }, [assignRoleToUser, selectedUserId, loadEffective]);

  const remove = useCallback(async (roleId: string) => {
    if (!selectedUserId) return;
    await removeRoleFromUser(selectedUserId, roleId);
    await loadEffective(selectedUserId);
  }, [removeRoleFromUser, selectedUserId, loadEffective]);

  const search = useCallback(async (q: string) => {
    await searchUsers({ query: q });
  }, [searchUsers]);

  return (
    <>{render({
      users,
      roles,
      search,
      selectUser,
      selectedUserId,
      assign,
      remove,
      effectivePermissions: effective,
      isLoading: searching || isLoading,
      error,
    })}</>
  );
}
export default UserRoleAssigner;

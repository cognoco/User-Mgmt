// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserRoleAssigner } from '@/ui/headless/admin/UserRoleAssigner';
import * as adminUsers from '@/hooks/admin/useAdminUsers';
import * as useRolesHook from '@/hooks/team/useRoles';
import { UserManagementConfiguration } from '@/core/config';
import { PermissionService } from '@/core/permission/interfaces';

vi.mock('@/hooks/admin/useAdminUsers');
vi.mock('@/hooks/team/useRoles');

describe('UserRoleAssigner', () => {
  it('assigns and removes roles', async () => {
    const searchUsers = vi.fn();
    vi.mocked(adminUsers.useAdminUsers).mockReturnValue({ users: [{ id: 'u1', firstName: 'A' }], searchUsers, isLoading: false, error: null });
    const assignRoleToUser = vi.fn();
    const removeRoleFromUser = vi.fn();
    vi.mocked(useRolesHook.useRoles).mockReturnValue({
      roles: [{ id: 'r1', name: 'Admin' }],
      assignRoleToUser,
      removeRoleFromUser,
      getUserRoles: vi.fn().mockResolvedValue([]),
      isLoading: false,
    } as any);
    const permissionService: PermissionService = {
      getUserResourcePermissions: vi.fn().mockResolvedValue([]),
    } as any;
    vi.spyOn(UserManagementConfiguration, 'getServiceProvider').mockReturnValue(permissionService);

    const renderProp = vi.fn(() => null);
    renderHook(() => <UserRoleAssigner render={renderProp} />);
    const args = renderProp.mock.calls[0][0];
    await act(async () => {
      await args.search('x');
      args.selectUser('u1');
      await args.assign('r1');
      await args.remove('r1');
    });
    expect(searchUsers).toHaveBeenCalled();
    expect(assignRoleToUser).toHaveBeenCalled();
    expect(removeRoleFromUser).toHaveBeenCalled();
  });
});

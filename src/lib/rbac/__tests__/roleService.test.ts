import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { Permission } from '../roles';
import {
  initializeRolePermissions,
  getRolePermissions,
  checkRolePermission,
  getAllRolesWithPermissions,
  syncRolePermissions,
} from '../roleService';
import { TeamRole } from '@prisma/client';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    rolePermission: {
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe('Role Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('initializeRolePermissions', () => {
    it('should create missing role permissions', async () => {
      vi.mocked(prisma.rolePermission.findMany).mockResolvedValue([]);
      vi.mocked(prisma.rolePermission.create).mockResolvedValue({} as any);

      await initializeRolePermissions();

      // Should create permissions for all roles
      expect(prisma.rolePermission.create).toHaveBeenCalled();
    });

    it('should not create existing role permissions', async () => {
      const existingPermission = {
        id: '1',
        role: TeamRole.ADMIN,
        permission: Permission.VIEW_TEAM_MEMBERS,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.rolePermission.findMany).mockResolvedValue([existingPermission]);
      vi.mocked(prisma.rolePermission.create).mockResolvedValue({} as any);

      await initializeRolePermissions();

      // Should not recreate existing permission
      expect(prisma.rolePermission.create).not.toHaveBeenCalledWith({
        data: {
          role: TeamRole.ADMIN,
          permission: Permission.VIEW_TEAM_MEMBERS,
        },
      });
    });
  });

  describe('getRolePermissions', () => {
    it('should return permissions for a role', async () => {
      const mockPermissions = [
        { permission: Permission.VIEW_TEAM_MEMBERS },
        { permission: Permission.INVITE_TEAM_MEMBER },
      ];

      vi.mocked(prisma.rolePermission.findMany).mockResolvedValue(mockPermissions);

      const permissions = await getRolePermissions(TeamRole.ADMIN);

      expect(permissions).toEqual([
        Permission.VIEW_TEAM_MEMBERS,
        Permission.INVITE_TEAM_MEMBER,
      ]);
      expect(prisma.rolePermission.findMany).toHaveBeenCalledWith({
        where: { role: TeamRole.ADMIN },
        select: { permission: true },
      });
    });
  });

  describe('checkRolePermission', () => {
    it('should return true when role has permission', async () => {
      vi.mocked(prisma.rolePermission.count).mockResolvedValue(1);

      const hasPermission = await checkRolePermission(
        TeamRole.ADMIN,
        Permission.VIEW_TEAM_MEMBERS
      );

      expect(hasPermission).toBe(true);
      expect(prisma.rolePermission.count).toHaveBeenCalledWith({
        where: {
          role: TeamRole.ADMIN,
          permission: Permission.VIEW_TEAM_MEMBERS,
        },
      });
    });

    it('should return false when role does not have permission', async () => {
      vi.mocked(prisma.rolePermission.count).mockResolvedValue(0);

      const hasPermission = await checkRolePermission(
        TeamRole.VIEWER,
        Permission.MANAGE_BILLING
      );

      expect(hasPermission).toBe(false);
    });

    it('should return false for invalid permission', async () => {
      const hasPermission = await checkRolePermission(
        TeamRole.ADMIN,
        'INVALID_PERMISSION'
      );

      expect(hasPermission).toBe(false);
      expect(prisma.rolePermission.count).not.toHaveBeenCalled();
    });
  });

  describe('syncRolePermissions', () => {
    it('should delete outdated permissions and initialize new ones', async () => {
      vi.mocked(prisma.rolePermission.deleteMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.rolePermission.findMany).mockResolvedValue([]);
      vi.mocked(prisma.rolePermission.create).mockResolvedValue({} as any);

      await syncRolePermissions();

      expect(prisma.rolePermission.deleteMany).toHaveBeenCalled();
      expect(prisma.rolePermission.findMany).toHaveBeenCalled();
      expect(prisma.rolePermission.create).toHaveBeenCalled();
    });
  });
});

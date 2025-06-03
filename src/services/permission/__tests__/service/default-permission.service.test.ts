import { describe, it, expect, beforeEach, vi } from "vitest";
import { DefaultPermissionService } from "../../default-permission.service";
import { PermissionValues } from "@/core/permission/models";
import { MemoryCache } from '@/lib/cache';
import { ResourcePermissionResolver } from '@/lib/services/resource-permission-resolver.service';

const USER_ID = "u1";
const ROLE_ID = "r1";

describe("DefaultPermissionService", () => {
  let provider: any;
  let resolver: any;
  let service: DefaultPermissionService;

  beforeEach(() => {
    provider = {
      getUserRoles: vi.fn(),
      assignRoleToUser: vi.fn(),
      removeRoleFromUser: vi.fn(),
      getRoleById: vi.fn(),
      assignResourcePermission: vi.fn(),
      removeResourcePermission: vi.fn(),
      getUserResourcePermissions: vi.fn(),
      getPermissionsForResource: vi.fn(),
      getUsersWithResourcePermission: vi.fn(),
    };
    resolver = { getEffectivePermissions: vi.fn().mockResolvedValue([]) } as ResourcePermissionResolver;
    service = new DefaultPermissionService(provider, { getEffectivePermissions: vi.fn() } as any, resolver);
    (DefaultPermissionService as any).roleCache = new MemoryCache({ ttl: 30000 });
    (DefaultPermissionService as any).resourceCache = new MemoryCache({ ttl: 30000 });
  });

  it("returns existing assignment if user already has role", async () => {
    const existing = { id: "ur1", userId: USER_ID, roleId: ROLE_ID };
    provider.getUserRoles.mockResolvedValue([existing]);
    const result = await service.assignRoleToUser(USER_ID, ROLE_ID, "a");
    expect(result).toBe(existing);
    expect(provider.assignRoleToUser).not.toHaveBeenCalled();
  });

  it("assigns role via provider when not assigned", async () => {
    provider.getUserRoles.mockResolvedValue([]);
    const assigned = { id: "ur2", userId: USER_ID, roleId: ROLE_ID };
    provider.assignRoleToUser.mockResolvedValue(assigned);
    const result = await service.assignRoleToUser(USER_ID, ROLE_ID, "a");
    expect(provider.assignRoleToUser).toHaveBeenCalledWith(
      USER_ID,
      ROLE_ID,
      "a",
      undefined,
    );
    expect(result).toBe(assigned);
  });

  it("removeRoleFromUser returns false if user lacks role", async () => {
    provider.getUserRoles.mockResolvedValue([]);
    const ok = await service.removeRoleFromUser(USER_ID, ROLE_ID);
    expect(ok).toBe(false);
    expect(provider.removeRoleFromUser).not.toHaveBeenCalled();
  });

  it("removeRoleFromUser delegates to provider when role exists", async () => {
    provider.getUserRoles.mockResolvedValue([{ roleId: ROLE_ID }]);
    provider.removeRoleFromUser.mockResolvedValue(true);
    const ok = await service.removeRoleFromUser(USER_ID, ROLE_ID);
    expect(provider.removeRoleFromUser).toHaveBeenCalledWith(USER_ID, ROLE_ID);
    expect(ok).toBe(true);
  });

  it("roleHasPermission returns false for unknown role", async () => {
    provider.getRoleById.mockResolvedValue(null);
    const has = await service.roleHasPermission(
      ROLE_ID,
      PermissionValues.MANAGE_ROLES,
    );
    expect(has).toBe(false);
  });

  it("roleHasPermission checks permission list", async () => {
    provider.getRoleById.mockResolvedValue({
      id: ROLE_ID,
      name: "ADMIN",
      description: "Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [PermissionValues.MANAGE_ROLES],
    });
    const has = await service.roleHasPermission(
      ROLE_ID,
      PermissionValues.MANAGE_ROLES,
    );
    expect(has).toBe(true);
  });

  it("caches resource permission checks", async () => {
    resolver.getEffectivePermissions.mockResolvedValue([]);
    provider.getUserRoles.mockResolvedValue([]);
    const perm = PermissionValues.VIEW_PROJECTS;
    const allowed1 = await service.hasResourcePermission(USER_ID, perm, 'project', 'p1');
    expect(resolver.getEffectivePermissions).toHaveBeenCalledTimes(1);
    expect(allowed1).toBe(false);
    const allowed2 = await service.hasResourcePermission(USER_ID, perm, 'project', 'p1');
    expect(resolver.getEffectivePermissions).toHaveBeenCalledTimes(1);
    expect(allowed2).toBe(false);
  });

  it("assignResourcePermission invalidates cache", async () => {
    resolver.getEffectivePermissions.mockResolvedValue([PermissionValues.VIEW_PROJECTS]);
    provider.assignResourcePermission.mockResolvedValue({ id: 'rp1' });
    const perm = PermissionValues.VIEW_PROJECTS;
    await service.hasResourcePermission(USER_ID, perm, 'project', 'p1');
    expect(resolver.getEffectivePermissions).toHaveBeenCalledTimes(1);
    await service.assignResourcePermission(USER_ID, perm, 'project', 'p1');
    const allowed = await service.hasResourcePermission(USER_ID, perm, 'project', 'p1');
    expect(resolver.getEffectivePermissions).toHaveBeenCalledTimes(2);
    expect(allowed).toBe(true);
  });

  it("hasPermission checks hierarchy and caches result", async () => {
    provider.getUserRoles.mockResolvedValue([{ roleId: ROLE_ID }]);
    const mockRoleService = { getEffectivePermissions: vi.fn().mockResolvedValue([PermissionValues.MANAGE_ROLES]) } as any;
    service = new DefaultPermissionService(provider, mockRoleService);
    (DefaultPermissionService as any).userPermissionCache = new MemoryCache({ ttl: 30000 });

    const allowed1 = await service.hasPermission(USER_ID, PermissionValues.MANAGE_ROLES);
    const allowed2 = await service.hasPermission(USER_ID, PermissionValues.MANAGE_ROLES);

    expect(mockRoleService.getEffectivePermissions).toHaveBeenCalledTimes(1);
    expect(allowed1).toBe(true);
    expect(allowed2).toBe(true);
  });
});

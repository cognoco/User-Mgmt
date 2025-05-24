import { describe, it, expect, beforeEach, vi } from "vitest";
import { DefaultPermissionService } from "../../default-permission.service";
import { PermissionValues } from "@/core/permission/models";

const USER_ID = "u1";
const ROLE_ID = "r1";

describe("DefaultPermissionService", () => {
  let provider: any;
  let service: DefaultPermissionService;

  beforeEach(() => {
    provider = {
      getUserRoles: vi.fn(),
      assignRoleToUser: vi.fn(),
      removeRoleFromUser: vi.fn(),
      getRoleById: vi.fn(),
    };
    service = new DefaultPermissionService(provider);
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
});

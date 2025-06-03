import { describe, it, expect, beforeEach } from 'vitest';
import { PermissionTestingService } from '../permission-testing.service';
import type { Permission } from '@/core/permission/models';

class FakePermissionService {
  roles: Record<string, { permissions: Permission[]; parent?: string }> = {};
  userRoles: Record<string, { roleId: string; expiresAt?: Date }[]> = {};
  resourcePerms: Record<string, { permission: Permission; type: string; id: string }[]> = {};
  resourceParents: Record<string, { type: string; id: string } | undefined> = {};

  addRole(id: string, permissions: Permission[], parent?: string) {
    this.roles[id] = { permissions, parent };
  }

  assignRole(userId: string, roleId: string, expiresAt?: Date) {
    if (!this.userRoles[userId]) this.userRoles[userId] = [];
    this.userRoles[userId].push({ roleId, expiresAt });
  }

  addResourcePermission(userId: string, permission: Permission, type: string, id: string) {
    if (!this.resourcePerms[userId]) this.resourcePerms[userId] = [];
    this.resourcePerms[userId].push({ permission, type, id });
  }

  setParentResource(type: string, id: string, parentType: string, parentId: string) {
    this.resourceParents[`${type}:${id}`] = { type: parentType, id: parentId };
  }

  private roleHasPermission(roleId: string, permission: Permission, seen = new Set<string>()): boolean {
    if (seen.has(roleId)) return false;
    seen.add(roleId);
    const role = this.roles[roleId];
    if (!role) return false;
    if (role.permissions.includes(permission)) return true;
    if (role.parent) return this.roleHasPermission(role.parent, permission, seen);
    return false;
  }

  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const roles = (this.userRoles[userId] || []).filter(r => !r.expiresAt || r.expiresAt > new Date());
    return roles.some(r => this.roleHasPermission(r.roleId, permission));
  }

  async hasResourcePermission(userId: string, permission: Permission, type: string, id: string): Promise<boolean> {
    const list = this.resourcePerms[userId] || [];
    const direct = list.some(p => p.permission === permission && p.type === type && p.id === id);
    if (direct) return true;
    let current = this.resourceParents[`${type}:${id}`];
    while (current) {
      const found = list.some(p => p.permission === permission && p.type === current!.type && p.id === current!.id);
      if (found) return true;
      current = this.resourceParents[`${current.type}:${current.id}`];
    }
    return false;
  }
}

describe('PermissionTestingService', () => {
  let service: PermissionTestingService;
  let provider: FakePermissionService;

  const PERM = 'EDIT_PROJECT' as Permission;

  beforeEach(() => {
    provider = new FakePermissionService();
    provider.addRole('parent', [PERM]);
    provider.addRole('child', [], 'parent');
    service = new PermissionTestingService(provider as any, {} as any, {} as any);
  });

  it('direct role assignment', async () => {
    provider.addRole('simple', [PERM]);
    provider.assignRole('u1', 'simple');
    const res = await service.testRoleHierarchy('u1', PERM);
    expect(res.success).toBe(true);
  });

  it('inherited role permission', async () => {
    provider.assignRole('u1', 'child');
    const res = await service.testRoleHierarchy('u1', PERM);
    expect(res.success).toBe(true);
  });

  it('direct resource permission', async () => {
    provider.addResourcePermission('u1', PERM, 'project', 'p1');
    const res = await service.testResourceInheritance('u1', PERM, 'project', 'p1');
    expect(res.success).toBe(true);
  });

  it('inherited resource permission', async () => {
    provider.addResourcePermission('u1', PERM, 'project', 'parent');
    provider.setParentResource('task', 't1', 'project', 'parent');
    const res = await service.testResourceInheritance('u1', PERM, 'task', 't1');
    expect(res.success).toBe(true);
  });

  it('expired permissions handled', async () => {
    const past = new Date(Date.now() - 1000);
    provider.assignRole('u1', 'simple', past);
    const res = await service.testExpiredPermission('u1', PERM);
    expect(res.success).toBe(true);
  });
});

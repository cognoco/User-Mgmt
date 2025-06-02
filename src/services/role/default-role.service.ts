export interface RoleRecord {
  id: string;
  permissionIds: string[];
  parentRoleId?: string | null;
}

export interface RoleHierarchyRecord extends RoleRecord {
  children: RoleHierarchyRecord[];
}

/**
 * Simple in-memory role service supporting hierarchy and permission inheritance.
 */
export class DefaultRoleService {
  private roles = new Map<string, RoleRecord>();
  private permissionCache = new Map<string, string[]>();

  addRole(role: RoleRecord): void {
    this.roles.set(role.id, { ...role });
    this.permissionCache.clear();
  }

  setParentRole(roleId: string, parentRoleId: string | null): void {
    const role = this.roles.get(roleId);
    if (role) {
      role.parentRoleId = parentRoleId;
      this.permissionCache.clear();
    }
  }

  removeParentRole(roleId: string): void {
    this.setParentRole(roleId, null);
  }

  getAncestorRoles(roleId: string): RoleRecord[] {
    const ancestors: RoleRecord[] = [];
    const visited = new Set<string>();
    let current = this.roles.get(roleId);
    while (current?.parentRoleId) {
      const parentId = current.parentRoleId;
      if (!parentId || visited.has(parentId)) break;
      visited.add(parentId);
      const parent = this.roles.get(parentId);
      if (!parent) break;
      ancestors.push(parent);
      current = parent;
    }
    return ancestors;
  }

  getDescendantRoles(roleId: string): RoleRecord[] {
    const descendants: RoleRecord[] = [];
    const visited = new Set<string>();
    const traverse = (id: string) => {
      for (const role of this.roles.values()) {
        if (role.parentRoleId === id && !visited.has(role.id)) {
          visited.add(role.id);
          descendants.push(role);
          traverse(role.id);
        }
      }
    };
    traverse(roleId);
    return descendants;
  }

  getRoleHierarchy(): RoleHierarchyRecord[] {
    const map = new Map<string, RoleHierarchyRecord>();
    for (const role of this.roles.values()) {
      map.set(role.id, { ...(role as RoleHierarchyRecord), children: [] });
    }
    const roots: RoleHierarchyRecord[] = [];
    for (const node of map.values()) {
      if (node.parentRoleId) {
        const parent = map.get(node.parentRoleId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  getEffectivePermissions(roleId: string): string[] {
    const resolve = (id: string, stack: Set<string>): string[] => {
      if (this.permissionCache.has(id)) return this.permissionCache.get(id)!;
      if (stack.has(id)) return [];
      const role = this.roles.get(id);
      if (!role) return [];
      stack.add(id);
      const perms = new Set(role.permissionIds);
      if (role.parentRoleId) {
        for (const p of resolve(role.parentRoleId, stack)) {
          perms.add(p);
        }
      }
      stack.delete(id);
      const arr = Array.from(perms);
      this.permissionCache.set(id, arr);
      return arr;
    };
    return resolve(roleId, new Set());
  }
}

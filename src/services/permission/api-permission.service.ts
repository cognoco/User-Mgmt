import { PermissionService } from '@/core/permission/interfaces';
import {
  Permission,
  Role,
  RoleWithPermissions,
  UserRole,
  PermissionAssignment,
  RoleCreationPayload,
  RoleUpdatePayload
} from '@/core/permission/models';
import { PermissionEventHandler } from '@/core/permission/events';

/**
 * API-based implementation of {@link PermissionService} for client usage.
 */
export class ApiPermissionService implements PermissionService {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const url = `/api/permissions/check?permission=${permission}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return false;
    const data = await res.json();
    return !!(data.data && data.data.hasPermission);
  }

  async hasRole(_userId: string, role: Role): Promise<boolean> {
    const url = `/api/permissions/check?permission=${role}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return false;
    const data = await res.json();
    return !!(data.data && data.data.hasPermission);
  }

  async getAllRoles(): Promise<RoleWithPermissions[]> {
    const res = await fetch('/api/team/roles', { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data.roles;
  }

  async getRoleById(roleId: string): Promise<RoleWithPermissions | null> {
    const res = await fetch(`/api/team/roles/${roleId}`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data.role;
  }

  async createRole(roleData: RoleCreationPayload): Promise<RoleWithPermissions> {
    const res = await fetch('/api/team/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(roleData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'create failed');
    return data.data.role ?? data.data;
  }

  async updateRole(roleId: string, roleData: RoleUpdatePayload): Promise<RoleWithPermissions> {
    const res = await fetch(`/api/team/roles/${roleId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(roleData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'update failed');
    return data.data.role ?? data.data;
  }

  async deleteRole(roleId: string): Promise<boolean> {
    const res = await fetch(`/api/team/roles/${roleId}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) return false;
    return true;
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const res = await fetch(`/api/user/${userId}/roles`, { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data.roles;
  }

  async assignRoleToUser(userId: string, roleId: string, assignedBy: string, expiresAt?: Date): Promise<UserRole> {
    const res = await fetch('/api/user/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, roleId, assignedBy, expiresAt })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'assign failed');
    return data.data.role ?? data.data;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
    const res = await fetch(`/api/user/${userId}/roles/${roleId}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) return false;
    return true;
  }

  async roleHasPermission(roleId: string, permission: Permission): Promise<boolean> {
    const role = await this.getRoleById(roleId);
    return !!role && role.permissions.includes(permission);
  }

  async addPermissionToRole(roleId: string, permission: Permission): Promise<PermissionAssignment> {
    const res = await fetch(`/api/team/roles/${roleId}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ permission })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'add failed');
    return data.data.permission ?? data.data;
  }

  async removePermissionFromRole(roleId: string, permission: Permission): Promise<boolean> {
    const res = await fetch(`/api/team/roles/${roleId}/permissions/${permission}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return res.ok;
  }

  async getAllPermissions(): Promise<Permission[]> {
    const res = await fetch('/api/permissions', { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data.permissions;
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.getRoleById(roleId);
    return role ? role.permissions : [];
  }

  async syncRolePermissions(): Promise<boolean> {
    const res = await fetch('/api/permissions/sync', { method: 'POST', credentials: 'include' });
    return res.ok;
  }

  onPermissionEvent(_handler: PermissionEventHandler): () => void {
    // Client-side API service does not support realtime events
    return () => {};
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

export function getApiPermissionService(): PermissionService {
  return new ApiPermissionService();
}

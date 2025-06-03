import type { PermissionService } from '@/core/permission/interfaces';
import type { Permission } from '@/core/permission/models';
import { RoleService } from '@/services/role';
import { ResourcePermissionResolver } from '@/lib/services/resource-permission-resolver.service';

export interface PermissionTestResult {
  scenario: string;
  success: boolean;
  reason: string;
}

export class PermissionTestingService {
  constructor(
    private permissionService: PermissionService,
    private roleService: RoleService,
    private resourceResolver: ResourcePermissionResolver,
  ) {}

  async testRoleHierarchy(userId: string, permission: Permission): Promise<PermissionTestResult> {
    const allowed = await this.permissionService.hasPermission(userId, permission);
    return {
      scenario: 'role-hierarchy',
      success: allowed,
      reason: allowed ? 'permission inherited via roles' : 'permission missing',
    };
  }

  async testResourceInheritance(
    userId: string,
    permission: Permission,
    resourceType: string,
    resourceId: string,
  ): Promise<PermissionTestResult> {
    const allowed = await this.permissionService.hasResourcePermission(
      userId,
      permission,
      resourceType,
      resourceId,
    );
    return {
      scenario: 'resource-inheritance',
      success: allowed,
      reason: allowed ? 'permission inherited from resource ancestors' : 'permission missing',
    };
  }

  async testExpiredPermission(
    userId: string,
    permission: Permission,
  ): Promise<PermissionTestResult> {
    const allowed = await this.permissionService.hasPermission(userId, permission);
    return {
      scenario: 'expired-permission',
      success: !allowed,
      reason: !allowed ? 'expired permissions ignored' : 'expired permission still active',
    };
  }
}

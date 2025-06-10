import { logUserAction } from '@/lib/audit/auditLogger';
import { Permission, PermissionValues, RoleValues } from '@/core/permission/models';

export interface PolicyViolation {
  userId: string;
  permission: Permission;
  reason: string;
}

export interface PermissionAssignmentRequest {
  userId: string;
  permission: Permission;
  roleName?: string;
  resourceType?: string;
  resourceId?: string;
}

export class PermissionPolicyService {
  async checkRoleAssignment(assignerId: string, userId: string, roleName: string): Promise<PolicyViolation | null> {
    if (roleName === RoleValues.SUPER_ADMIN && assignerId === userId) {
      return {
        userId: assignerId,
        permission: PermissionValues.ADMIN_ACCESS,
        reason: 'Cannot self assign SUPER_ADMIN role',
      };
    }
    return null;
  }

  async checkRolePermissionAssignment(roleName: string, permission: Permission): Promise<PolicyViolation | null> {
    if (permission === PermissionValues.ADMIN_ACCESS && roleName !== RoleValues.SUPER_ADMIN) {
      return {
        userId: '',
        permission,
        reason: 'ADMIN_ACCESS only allowed for SUPER_ADMIN role',
      };
    }
    return null;
  }

  async checkResourcePermissionAssignment(
    userId: string,
    permission: Permission,
    resourceType: string,
  ): Promise<PolicyViolation | null> {
    if (permission === PermissionValues.ADMIN_ACCESS) {
      return {
        userId,
        permission,
        reason: 'ADMIN_ACCESS cannot be granted on resources',
      };
    }
    return null;
  }

  async validateBulkOperations(requests: PermissionAssignmentRequest[]): Promise<PolicyViolation[]> {
    const violations: PolicyViolation[] = [];
    for (const r of requests) {
      if (r.roleName) {
        const v = await this.checkRolePermissionAssignment(r.roleName, r.permission);
        if (v) violations.push(v);
      } else if (r.resourceType) {
        const v = await this.checkResourcePermissionAssignment(r.userId, r.permission, r.resourceType);
        if (v) violations.push(v);
      }
    }
    return violations;
  }

  async checkCompliance(requests: PermissionAssignmentRequest[]): Promise<PolicyViolation[]> {
    return this.validateBulkOperations(requests);
  }

  async reportViolations(violations: PolicyViolation[]): Promise<void> {
    for (const v of violations) {
      await logUserAction({
        userId: v.userId,
        action: 'POLICY_VIOLATION',
        status: 'FAILURE',
        targetResourceType: 'permission',
        targetResourceId: v.permission,
        details: { reason: v.reason },
      });
    }
  }
}

export { DefaultRoleService } from '@/services/role/defaultRole.service';
export type { RoleRecord, RoleHierarchyRecord } from '@/services/role/defaultRole.service';
export { RoleService } from '@/services/role/role.service';
export type {
  Role,
  RoleCreateData,
  RoleUpdateData,
  UserRoleAssignment,
  RoleHierarchyNode,
} from '@/services/role/role.service';
export { getApiRoleService } from '@/services/role/factory';

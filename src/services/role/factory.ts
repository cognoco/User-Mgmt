import type { RoleService as IRoleService } from '@/core/role/interfaces';
import { RoleService } from './role.service';

/**
 * Role Service Factory for API routes
 */
export function getApiRoleService(): IRoleService {
  return new RoleService();
}

import { RoleService } from './role.service';

/**
 * Role Service Factory for API routes
 */
export function getApiRoleService(): RoleService {
  return new RoleService();
}

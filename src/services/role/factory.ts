import type { RoleService as IRoleService } from "@/core/role/interfaces";
import { RoleService } from "@/src/services/role/role.service"76;
import { getServiceContainer } from "@/lib/config/serviceContainer"123;

export interface ApiRoleServiceOptions {
  /** Reset cached instance */
  reset?: boolean;
}

let cachedService: IRoleService | null = null;
let constructing = false;

/**
 * Role Service Factory for API routes
 */
export function getApiRoleService(
  options: ApiRoleServiceOptions = {},
): IRoleService {
  if (options.reset) {
    cachedService = null;
  }

  if (cachedService && !options.reset) {
    return cachedService;
  }

  if (!constructing) {
    constructing = true;
    try {
      const container = getServiceContainer();
      if (container.role) {
        cachedService = container.role;
      }
    } finally {
      constructing = false;
    }
  }

  if (!cachedService) {
    cachedService = new RoleService();
  }

  return cachedService;
}

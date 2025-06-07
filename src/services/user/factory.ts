/**
 * User Service Factory for API Routes
 *
 * This file provides factory functions for creating user services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { UserService } from "@/core/user/interfaces";
import type { IUserDataProvider } from "@/core/user/IUserDataProvider";
import { DefaultUserService } from "@/src/services/user/defaultUser.service";
import { AdapterRegistry } from "@/adapters/registry";
import { getServiceContainer } from "@/lib/config/serviceContainer";

export interface ApiUserServiceOptions {
  /**
   * When true, clears any cached instance to allow a fresh one to be created.
   * Primarily used in tests.
   */
  reset?: boolean;
}

let cachedService: UserService | null = null;
let constructing = false;

/**
 * Get the configured user service instance for API routes
 *
 * @returns Configured UserService instance
 */
export function getApiUserService(
  options: ApiUserServiceOptions = {},
): UserService {
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
      if (container.user) {
        cachedService = container.user;
      }
    } finally {
      constructing = false;
    }
  }

  if (!cachedService) {
    const userDataProvider =
      AdapterRegistry.getInstance().getAdapter<IUserDataProvider>("user");
    cachedService = new DefaultUserService(userDataProvider);
  }

  return cachedService;
}

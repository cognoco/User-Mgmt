export interface ApiConfiguration {
  authService?: import("@/core/auth/interfaces").AuthService;
  userService?: import("@/core/user/interfaces").UserService;
  permissionService?: import("@/core/permission/interfaces").PermissionService;
}

let apiConfig: ApiConfiguration = {};

export function configureApiServices(config: ApiConfiguration): void {
  apiConfig = { ...apiConfig, ...config };
}

export function resetApiServices(): void {
  apiConfig = {};
}

export function getConfiguredAuthService(): import("@/core/auth/interfaces").AuthService {
  const { getApiAuthService } = require("@/services/auth/factory");
  return apiConfig.authService ?? getApiAuthService();
}

export function getConfiguredUserService(): import("@/core/user/interfaces").UserService {
  const { getApiUserService } = require("@/services/user/factory");
  return apiConfig.userService ?? getApiUserService();
}

export function getConfiguredPermissionService(): import("@/core/permission/interfaces").PermissionService {
  const { getApiPermissionService } = require("@/services/permission/factory");
  return apiConfig.permissionService ?? getApiPermissionService();
}

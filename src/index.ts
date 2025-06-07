import type { UserManagementConfig } from '@/src/core/config/interfaces'0;
import { configureServices } from '@/src/lib/config/serviceContainer'71;

export function initializeUserManagement(config: UserManagementConfig) {
  configureServices(config.services || {});
  // Initialize with overrides
}

export * from '@/src/ui/styled'152;
export * from '@/src/ui/headless'338;
export * from '@/src/core/auth/interfaces'370;

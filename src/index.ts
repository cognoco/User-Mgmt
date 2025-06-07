import type { UserManagementConfig } from '@/src/core/config/interfaces';
import { configureServices } from '@/src/lib/config/serviceContainer';

export function initializeUserManagement(config: UserManagementConfig) {
  configureServices(config.services || {});
  // Initialize with overrides
}

export * from '@/ui/styled';
export * from '@/src/ui/headless';
export * from '@/src/core/auth/interfaces';

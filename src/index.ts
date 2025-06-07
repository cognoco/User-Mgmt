import type { UserManagementConfig } from '@/core/config/interfaces';
import { configureServices } from '@/lib/config/serviceContainer';

export function initializeUserManagement(config: UserManagementConfig) {
  configureServices(config.services || {});
  // Initialize with overrides
}

export * from '@/ui/styled';
export * as Headless from '@/ui/headless';
export * from '@/core/auth/interfaces';

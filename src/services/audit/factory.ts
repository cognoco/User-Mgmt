/**
 * Audit Service Factory for API Routes
 * 
 * This file provides factory functions for creating audit services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { AuditService } from '@/core/audit/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { IAuditDataProvider } from '@/core/audit';
import { AdapterRegistry } from '@/adapters/registry';
import { DefaultAuditService } from './default-audit.service';
import {
  getServiceContainer,
  getServiceConfiguration,
} from '@/lib/config/service-container';

// Singleton instance for API routes
export interface ApiAuditServiceOptions {
  /** When true, clears the cached instance. Useful for tests */
  reset?: boolean;
}

let auditServiceInstance: AuditService | null = null;
let constructing = false;

/**
 * Get the configured audit service instance for API routes
 * 
 * @returns Configured AuditService instance
 */
export function getApiAuditService(
  options: ApiAuditServiceOptions = {},
): AuditService | undefined {
  if (options.reset) {
    auditServiceInstance = null;
  }

  if (!auditServiceInstance && !constructing) {
    constructing = true;
    try {
      const containerService = getServiceContainer().audit;
      if (containerService) {
        auditServiceInstance = containerService;
      }
    } finally {
      constructing = false;
    }
  }

  if (!auditServiceInstance) {
    const config = getServiceConfiguration();
    if (config.featureFlags?.audit === false) {
      return undefined;
    }

    auditServiceInstance =
      config.auditService ||
      (UserManagementConfiguration.getServiceProvider('auditService') as AuditService | undefined);

    if (!auditServiceInstance) {
      const provider = AdapterRegistry.getInstance().getAdapter<IAuditDataProvider>('audit');
      auditServiceInstance = new DefaultAuditService(provider);
    }
  }

  return auditServiceInstance;
}

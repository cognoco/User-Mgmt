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

// Singleton instance for API routes
let auditServiceInstance: AuditService | null = null;

/**
 * Get the configured audit service instance for API routes
 * 
 * @returns Configured AuditService instance
 */
export function getApiAuditService(): AuditService {
  if (!auditServiceInstance) {
    // Get the audit adapter from the registry
    AdapterRegistry.getInstance().getAdapter<IAuditDataProvider>('audit');

    // Retrieve the service implementation
    auditServiceInstance = UserManagementConfiguration.getServiceProvider('auditService') as AuditService;

    // If no audit service is registered, throw an error
    if (!auditServiceInstance) {
      throw new Error('Audit service not registered in UserManagementConfiguration');
    }
  }
  
  return auditServiceInstance;
}

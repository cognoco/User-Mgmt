/**
 * Audit Service Factory for API Routes
 * 
 * This file provides factory functions for creating audit services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { AuditService } from '@/core/audit/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import { createAuditProvider } from '@/adapters/audit/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let auditServiceInstance: AuditService | null = null;

/**
 * Get the configured audit service instance for API routes
 * 
 * @returns Configured AuditService instance
 */
export function getApiAuditService(): AuditService {
  if (!auditServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create audit data provider
    const auditDataProvider = createAuditProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create audit service with the data provider
    auditServiceInstance = UserManagementConfiguration.getServiceProvider('auditService') as AuditService;
    
    // If no audit service is registered, throw an error
    if (!auditServiceInstance) {
      throw new Error('Audit service not registered in UserManagementConfiguration');
    }
  }
  
  return auditServiceInstance;
}

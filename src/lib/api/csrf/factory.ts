/**
 * CSRF Service Factory for API Routes
 * 
 * This file provides factory functions for creating CSRF services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { CsrfService } from '@/core/csrf/interfaces';
import { createCsrfProvider } from '@/adapters/csrf/factory';
import { DefaultCsrfService } from '@/services/csrf/default-csrf.service';

// Singleton instance for API routes
let csrfServiceInstance: CsrfService | null = null;

/**
 * Get the configured CSRF service instance for API routes
 * 
 * @returns Configured CsrfService instance
 */
export function getApiCsrfService(): CsrfService {
  if (!csrfServiceInstance) {
    const csrfDataProvider = createCsrfProvider({ type: 'default' });
    csrfServiceInstance = new DefaultCsrfService(csrfDataProvider);
  }
  return csrfServiceInstance;
}

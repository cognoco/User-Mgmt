/**
 * Session Service Factory for API Routes
 * 
 * This file provides factory functions for creating session services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { SessionService } from '@/core/session/interfaces';
import type { ISessionDataProvider } from '@/core/session';
import { AdapterRegistry } from '@/adapters/registry';
import { api } from '@/lib/api/axios';
import { DefaultSessionService } from './default-session.service';

// Singleton instance for API routes
let sessionServiceInstance: SessionService | null = null;

/**
 * Get the configured session service instance for API routes
 * 
 * @returns Configured SessionService instance
 */
export function getApiSessionService(): SessionService {
  if (!sessionServiceInstance) {
    const sessionDataProvider = AdapterRegistry.getInstance().getAdapter<ISessionDataProvider>('session');
    sessionServiceInstance = new DefaultSessionService(api, sessionDataProvider);
  }
  
  return sessionServiceInstance;
}

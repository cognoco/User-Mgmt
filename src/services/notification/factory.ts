/**
 * Notifications Service Factory for API Routes
 * 
 * This file provides factory functions for creating notification services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { NotificationService } from '@/core/notification/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { INotificationDataProvider } from '@/core/notification';
import { createNotificationProvider } from '@/adapters/notification/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let notificationServiceInstance: NotificationService | null = null;

/**
 * Get the configured notification service instance for API routes
 * 
 * @returns Configured NotificationService instance
 */
export function getApiNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create notification data provider
    const notificationDataProvider: INotificationDataProvider = createNotificationProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create notification service with the data provider
    notificationServiceInstance = UserManagementConfiguration.getServiceProvider('notificationService') as NotificationService;
    
    // If no notification service is registered, throw an error
    if (!notificationServiceInstance) {
      throw new Error('Notification service not registered in UserManagementConfiguration');
    }
  }
  
  return notificationServiceInstance;
}

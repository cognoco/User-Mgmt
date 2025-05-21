/**
 * Application Configuration
 * 
 * This file configures the User Management Module with the necessary service providers
 * and feature flags to make the application work.
 * 
 * @deprecated Use initializeUserManagement from './initialize-adapters' instead.
 */

import { UserManagementConfiguration } from '@/core/config';
import { initializeUserManagement } from './initialize-adapters';

// Initialize the User Management Module with default configuration
// This maintains backward compatibility with existing code
const services = initializeUserManagement({
  type: 'supabase',
  options: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  }
});

// Export the UserManagementConfiguration for backward compatibility
export default UserManagementConfiguration;

// Re-export the initialization function for new code
export { initializeUserManagement };

/**
 * Address Service Factory for API Routes
 * 
 * This file provides factory functions for creating address services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { CompanyAddressService } from '@/core/address/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import { createAddressProvider } from '@/adapters/address/factory';
import { getServiceSupabase } from '@/lib/database/supabase';

// Singleton instance for API routes
let addressServiceInstance: CompanyAddressService | null = null;

/**
 * Get the configured address service instance for API routes
 * 
 * @returns Configured AddressService instance
 */
export function getApiAddressService(): CompanyAddressService {
  if (!addressServiceInstance) {
    // Get Supabase configuration from the existing service
    const supabase = getServiceSupabase();
    
    // Create address data provider
    const addressDataProvider = createAddressProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    
    // Create address service with the data provider
    addressServiceInstance = UserManagementConfiguration.getServiceProvider('addressService') as CompanyAddressService;
    
    // If no address service is registered, throw an error
    if (!addressServiceInstance) {
      throw new Error('Address service not registered in UserManagementConfiguration');
    }
  }
  
  return addressServiceInstance;
}

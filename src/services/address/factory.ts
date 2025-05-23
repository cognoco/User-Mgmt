/**
 * Address Service Factory for API Routes
 * 
 * This file provides factory functions for creating address services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { CompanyAddressService } from '@/core/address/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { IAddressDataProvider } from '@/core/address';
import { AdapterRegistry } from '@/adapters/registry';
import { DefaultAddressService } from './default-address.service';

// Singleton instance for API routes
let addressServiceInstance: CompanyAddressService | null = null;

/**
 * Get the configured address service instance for API routes
 * 
 * @returns Configured AddressService instance
 */
export function getApiAddressService(): CompanyAddressService {
  if (!addressServiceInstance) {
    addressServiceInstance =
      UserManagementConfiguration.getServiceProvider('addressService') as CompanyAddressService | undefined;

    if (!addressServiceInstance) {
      const provider = AdapterRegistry.getInstance().getAdapter<IAddressDataProvider>('address');
      addressServiceInstance = new DefaultAddressService(provider);
    }
  }

  return addressServiceInstance;
}

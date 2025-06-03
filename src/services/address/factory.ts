/**
 * Address Service Factory for API Routes
 * 
 * This file provides factory functions for creating address services for use in API routes.
 * It ensures consistent configuration and dependency injection across all API endpoints.
 */

import { CompanyAddressService, AddressService } from '@/core/address/interfaces';
import { UserManagementConfiguration } from '@/core/config';
import type { IAddressDataProvider } from '@/core/address';
import { AdapterRegistry } from '@/adapters/registry';
import { DefaultAddressService } from './default-address.service';

// Singleton instances for API routes
let addressServiceInstance: CompanyAddressService | null = null;
let personalAddressServiceInstance: AddressService | null = null;

/**
 * Get the configured address service instance for API routes (Company addresses)
 * 
 * @returns Configured CompanyAddressService instance
 */
export function getApiAddressService(): CompanyAddressService {
  if (!addressServiceInstance) {
    const configuredService = UserManagementConfiguration.getServiceProvider('addressService') as CompanyAddressService;
    
    if (configuredService) {
      addressServiceInstance = configuredService;
    } else {
      const provider = AdapterRegistry.getInstance().getAdapter<IAddressDataProvider>('address');
      addressServiceInstance = new DefaultAddressService(provider) as unknown as CompanyAddressService;
    }
  }

  return addressServiceInstance;
}

/**
 * Get the configured personal address service instance for API routes (User addresses)
 * 
 * @returns Configured AddressService instance
 */
export function getApiPersonalAddressService(): AddressService {
  if (!personalAddressServiceInstance) {
    const configuredService = UserManagementConfiguration.getServiceProvider('personalAddressService') as AddressService;
    
    if (configuredService) {
      personalAddressServiceInstance = configuredService;
    } else {
      const provider = AdapterRegistry.getInstance().getAdapter<IAddressDataProvider>('address');
      personalAddressServiceInstance = new DefaultAddressService(provider);
    }
  }

  return personalAddressServiceInstance;
}

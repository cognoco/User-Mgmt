/**
 * Adapter Configuration
 * 
 * This file provides types and utilities for configuring adapters
 * in the User Management Module.
 */

import { AdapterFactory, AdapterFactoryOptions } from '@/adapters/registry';

/**
 * Adapter configuration interface
 */
export interface AdapterConfig {
  /**
   * The type of adapter to use (e.g., 'supabase', 'graphql')
   */
  type: string;
  
  /**
   * Options to pass to the adapter factory
   */
  options: AdapterFactoryOptions;
}

/**
 * Default adapter configuration
 */
export const DEFAULT_ADAPTER_CONFIG: AdapterConfig = {
  type: 'supabase',
  options: {
    // These should be provided by the application
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  }
};

/**
 * Creates an adapter factory based on the provided configuration
 * 
 * @param config Adapter configuration
 * @returns An adapter factory instance
 * @throws Error if the adapter type is not registered or configuration is invalid
 */
export function createAdapterFactory(config: AdapterConfig): AdapterFactory {
  const { type, options } = config;
  
  // Import dynamically to avoid circular dependencies
  const { AdapterRegistry } = require('@/adapters');
  
  if (!AdapterRegistry.isAdapterAvailable(type)) {
    const availableAdapters = AdapterRegistry.listAvailableAdapters().join(', ');
    throw new Error(
      `Adapter type '${type}' is not available. Available adapters: ${availableAdapters}`
    );
  }
  
  return AdapterRegistry.getFactory(type, options);
}

/**
 * Validates that required environment variables are set for the adapter
 * 
 * @param config Adapter configuration
 * @throws Error if required environment variables are missing
 */
export function validateAdapterConfig(config: AdapterConfig): void {
  const { type, options } = config;
  
  switch (type) {
    case 'supabase':
      if (!options.supabaseUrl || !options.supabaseKey) {
        throw new Error(
          'Supabase adapter requires supabaseUrl and supabaseKey to be set in the configuration.'
        );
      }
      break;
      
    // Add validation for other adapter types as needed
    
    default:
      // No specific validation for unknown adapter types
      break;
  }
}

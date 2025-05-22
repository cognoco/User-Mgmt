/**
 * Adapters Exports
 * 
 * This file exports all adapter related types and functions.
 * It provides a single entry point for importing adapters and registering factories.
 */

export * from './registry';
export * from './auth';
export * from './user';
export * from './team';
export * from './permission';
export * from './notification';
export * from './csrf';

// Import and register the Supabase adapter factory by default
import { AdapterRegistry } from './registry';
import { createSupabaseAdapterFactory } from './supabase-factory';

// Register the Supabase adapter factory
AdapterRegistry.registerFactory('supabase', createSupabaseAdapterFactory);

// Re-export the registry instance for convenience
export { AdapterRegistry as default } from './registry';

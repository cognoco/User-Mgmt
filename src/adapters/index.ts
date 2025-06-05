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
export * from './sso';
export * from './api-keys';
export * from './notification';
export * from './gdpr';
export * from './consent';
export * from './session';
export * from './two-factor';
export * from './oauth';
export * from './subscription';
export * from './company-notification';
export * from './organization';
export * from './admin';
export * from './csrf';
export * from './webhooks';
export * from './database';


// Import and register the Supabase adapter factory by default
import { AdapterRegistry } from './registry';
import { createSupabaseAdapterFactory } from './supabase-factory';
import { createSupabaseDatabaseProvider } from './database/factory/supabase-factory';

// Register the Supabase adapter factory
AdapterRegistry.registerFactory('supabase', createSupabaseAdapterFactory);
AdapterRegistry.registerDatabaseFactory('supabase', createSupabaseDatabaseProvider);

// Re-export the registry instance for convenience
export { AdapterRegistry as default } from "./registry";

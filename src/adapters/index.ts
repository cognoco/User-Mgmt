/**
 * Adapters Exports
 * 
 * This file exports all adapter related types and functions.
 * It provides a single entry point for importing adapters and registering factories.
 */

export * from '@/src/adapters/registry';
export * from '@/src/adapters/address';
export * from '@/src/adapters/admin';
export * from '@/src/adapters/apiKeys';
export * from '@/src/adapters/audit';
export * from '@/src/adapters/auth';
export * from '@/src/adapters/companyNotification';
export * from '@/src/adapters/consent';
export * from '@/src/adapters/csrf';
export * from '@/src/adapters/dataExport';
export * from '@/src/adapters/database';
export * from '@/src/adapters/gdpr';
export * from '@/src/adapters/notification';
export * from '@/src/adapters/oauth';
export * from '@/src/adapters/organization';
export * from '@/src/adapters/permission';
export * from '@/src/adapters/resourceRelationship';
export * from '@/src/adapters/savedSearch';
export * from '@/src/adapters/session';
export * from '@/src/adapters/sso';
export * from '@/src/adapters/storage';
export * from '@/src/adapters/subscription';
export * from '@/src/adapters/team';
export * from '@/src/adapters/twoFactor';
export * from '@/src/adapters/user';
export * from '@/src/adapters/webhooks';


// Import and register the Supabase adapter factory by default
import { AdapterRegistry } from '@/src/adapters/registry';
import { createSupabaseAdapterFactory } from '@/src/adapters/supabaseFactory';
import { createSupabaseDatabaseProvider } from '@/src/adapters/database/factory/supabaseFactory';

// Register the Supabase adapter factory
AdapterRegistry.registerFactory('supabase', createSupabaseAdapterFactory);
AdapterRegistry.registerDatabaseFactory('supabase', createSupabaseDatabaseProvider);

// Re-export the registry instance for convenience
export { AdapterRegistry as default } from "@/src/adapters/registry";

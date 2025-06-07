/**
 * Adapters Exports
 * 
 * This file exports all adapter related types and functions.
 * It provides a single entry point for importing adapters and registering factories.
 */

export * from '@/adapters/registry';
export * from '@/adapters/address';
export * from '@/adapters/admin';
export * from '@/adapters/api-keys';
export * from '@/adapters/audit';
export * from '@/adapters/auth';
export * from '@/adapters/companyNotification';
export * from '@/adapters/consent';
export * from '@/adapters/csrf';
export * from '@/adapters/dataExport';
export * from '@/adapters/database';
export * from '@/adapters/gdpr';
export * from '@/adapters/notification';
export * from '@/adapters/oauth';
export * from '@/adapters/organization';
export * from '@/adapters/permission';
export * from '@/adapters/resourceRelationship';
export * from '@/adapters/savedSearch';
export * from '@/adapters/session';
export * from '@/adapters/sso';
export * from '@/adapters/storage';
export * from '@/adapters/subscription';
export * from '@/adapters/team';
export * from '@/adapters/twoFactor';
export * from '@/adapters/user';
export * from '@/adapters/webhooks';


// Import and register the Supabase adapter factory by default
import { AdapterRegistry } from '@/adapters/registry';
import { createSupabaseAdapterFactory } from '@/adapters/supabaseFactory';
import { createSupabaseDatabaseProvider } from '@/adapters/database/factory/supabaseFactory';

// Register the Supabase adapter factory
AdapterRegistry.registerFactory('supabase', createSupabaseAdapterFactory);
AdapterRegistry.registerDatabaseFactory('supabase', createSupabaseDatabaseProvider);

// Re-export the registry instance for convenience
export { AdapterRegistry as default } from "@/adapters/registry";

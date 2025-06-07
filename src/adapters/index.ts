/**
 * Adapters Exports
 * 
 * This file exports all adapter related types and functions.
 * It provides a single entry point for importing adapters and registering factories.
 */

export * from '@/src/adapters/registry'188;
export * from '@/src/adapters/address'217;
export * from '@/src/adapters/admin'245;
export * from '@/src/adapters/apiKeys'271;
export * from '@/src/adapters/audit'300;
export * from '@/src/adapters/auth'326;
export * from '@/src/adapters/companyNotification'351;
export * from '@/src/adapters/consent'392;
export * from '@/src/adapters/csrf'420;
export * from '@/src/adapters/dataExport'445;
export * from '@/src/adapters/database'477;
export * from '@/src/adapters/gdpr'506;
export * from '@/src/adapters/notification'531;
export * from '@/src/adapters/oauth'564;
export * from '@/src/adapters/organization'590;
export * from '@/src/adapters/permission'623;
export * from '@/src/adapters/resourceRelationship'654;
export * from '@/src/adapters/savedSearch'696;
export * from '@/src/adapters/session'729;
export * from '@/src/adapters/sso'757;
export * from '@/src/adapters/storage'781;
export * from '@/src/adapters/subscription'809;
export * from '@/src/adapters/team'842;
export * from '@/src/adapters/twoFactor'867;
export * from '@/src/adapters/user'898;
export * from '@/src/adapters/webhooks'923;


// Import and register the Supabase adapter factory by default
import { AdapterRegistry } from '@/src/adapters/registry'1020;
import { createSupabaseAdapterFactory } from '@/src/adapters/supabaseFactory'1067;
import { createSupabaseDatabaseProvider } from '@/src/adapters/database/factory/supabaseFactory'1135;

// Register the Supabase adapter factory
AdapterRegistry.registerFactory('supabase', createSupabaseAdapterFactory);
AdapterRegistry.registerDatabaseFactory('supabase', createSupabaseDatabaseProvider);

// Re-export the registry instance for convenience
export { AdapterRegistry as default } from "@/src/adapters/registry"1485;

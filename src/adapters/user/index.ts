/**
 * User Adapter Exports
 * 
 * This file exports all user adapter related types and functions.
 */

export type { IUserDataProvider } from '@/core/user/IUserDataProvider';
export { createUserProvider } from '@/adapters/user/factory';
// Export Supabase-specific items from the main provider file to avoid duplicates
export { SupabaseUserProvider } from '@/adapters/user/supabaseUserProvider';
export { createSupabaseUserProvider } from '@/adapters/user/factory';

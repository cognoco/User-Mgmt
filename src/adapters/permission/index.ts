/**
 * Permission Adapter Exports
 * 
 * This file exports all permission adapter related types and functions.
 */

export type { IPermissionDataProvider } from '@/core/permission/IPermissionDataProvider';
export { createPermissionProvider } from '@/adapters/permission/factory';
// Export Supabase-specific items from the main provider file to avoid duplicates
export { SupabasePermissionProvider } from '@/adapters/permission/supabasePermissionProvider';
export { createSupabasePermissionProvider } from '@/adapters/permission/factory';

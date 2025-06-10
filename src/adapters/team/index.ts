/**
 * Team Adapter Exports
 * 
 * This file exports all team adapter related types and functions.
 */

export type { ITeamDataProvider } from '@/core/team/ITeamDataProvider';
export { createTeamProvider } from '@/adapters/team/factory';
// Export Supabase-specific items from the main provider file to avoid duplicates
export { SupabaseTeamProvider } from '@/adapters/team/supabaseTeamProvider';
export { createSupabaseTeamProvider } from '@/adapters/team/factory';

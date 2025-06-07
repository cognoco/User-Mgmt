/**
 * Create a Supabase database provider.
 *
 * @param options Configuration options including the `connectionString` used to connect
 *   to Supabase. Additional options are passed through to the provider.
 * @returns Instance of {@link SupabaseProvider} implementing {@link DatabaseProvider}.
 */
import { SupabaseProvider } from '@/src/lib/database/providers/supabase';
import type { DatabaseConfig, DatabaseProvider } from '@/src/lib/database/types';

export function createSupabaseDatabaseProvider(options: DatabaseConfig): DatabaseProvider {
  return new SupabaseProvider({ ...options, provider: 'supabase' });
}

export default createSupabaseDatabaseProvider;

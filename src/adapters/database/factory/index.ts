export { createSupabaseDatabaseProvider } from '@/adapters/database/factory/supabaseFactory';
export { createPrismaDatabaseProvider } from '@/adapters/database/factory/prismaFactory';
export { createMockDatabaseProvider } from '@/adapters/database/factory/mockFactory';

import type { DatabaseConfig, DatabaseProvider } from '@/lib/database/types';

/**
 * Get a database provider instance by name.
 *
 * @param provider Provider identifier ('supabase' | 'prisma' | 'mock').
 * @param config   Configuration object specific to the provider.
 */
export function getDatabaseProvider(
  provider: 'supabase' | 'prisma' | 'mock',
  config: DatabaseConfig
): DatabaseProvider {
  switch (provider) {
    case 'supabase':
      return createSupabaseDatabaseProvider(config);
    case 'prisma':
      return createPrismaDatabaseProvider(config);
    case 'mock':
      return createMockDatabaseProvider(config);
    default:
      throw new Error(`Unsupported database provider: ${provider}`);
  }
}

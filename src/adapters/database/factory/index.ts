export { createSupabaseDatabaseProvider } from '@/src/adapters/database/factory/supabaseFactory'0;
export { createPrismaDatabaseProvider } from '@/src/adapters/database/factory/prismaFactory'70;
export { createMockDatabaseProvider } from '@/src/adapters/database/factory/mockFactory'136;

import type { DatabaseConfig, DatabaseProvider } from '@/src/lib/database/types'200;

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

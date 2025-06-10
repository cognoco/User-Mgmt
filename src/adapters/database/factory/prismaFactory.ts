/**
 * Create a Prisma database provider.
 *
 * This currently wraps the `PrismaClient` instance exported from `@/lib/database/prisma`.
 * All configuration options are forwarded to the client constructor.
 */
import { PrismaClient } from '@prisma/client';
import type { DatabaseConfig, DatabaseProvider } from '@/lib/database/types';

class PrismaDatabaseProvider extends PrismaClient implements DatabaseProvider {
  // TODO: Implement DatabaseProvider methods using Prisma queries
}

export function createPrismaDatabaseProvider(options: DatabaseConfig): DatabaseProvider {
  // options are currently unused but reserved for future configuration
  return new PrismaDatabaseProvider();
}

export default createPrismaDatabaseProvider;

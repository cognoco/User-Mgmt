import { describe, it, expect } from 'vitest';
import { getDatabaseProvider } from '@/src/adapters/database/factory/index';
import { createMockDatabaseProvider } from '@/src/adapters/database/factory/mockFactory';
import { createSupabaseDatabaseProvider } from '@/src/adapters/database/factory/supabaseFactory';

// Minimal config used for factories
const config = { provider: 'supabase', connectionString: 'supabase://test' } as any;

describe('database provider factory', () => {
  it('returns supabase provider', () => {
    const provider = getDatabaseProvider('supabase', config);
    expect(provider).toBeInstanceOf(Object);
  });

  it('returns mock provider', () => {
    const provider = getDatabaseProvider('mock', config);
    expect(provider).toBeInstanceOf(Object);
  });

  it('exposes factory functions', () => {
    expect(createMockDatabaseProvider).toBeInstanceOf(Function);
    expect(createSupabaseDatabaseProvider).toBeInstanceOf(Function);
  });
});

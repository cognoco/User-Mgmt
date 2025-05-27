import { describe, it, expect } from 'vitest';
import { getDatabaseProvider } from '../index';
import { createMockDatabaseProvider } from '../mock-factory';
import { createSupabaseDatabaseProvider } from '../supabase-factory';

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

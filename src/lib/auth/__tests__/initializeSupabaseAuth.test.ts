import { describe, beforeEach, test, expect, vi } from 'vitest';
import { supabase, createClient, resetSupabaseMock } from '@/tests/mocks/supabase';

// dynamic import to get fresh module per test

describe('initializeSupabaseAuth', () => {
  beforeEach(() => {
    vi.resetModules();
    resetSupabaseMock();
  });

  test('initializes client and registers listener', async () => {
    const { initializeSupabaseAuth } = await import('@/src/lib/auth/initializeSupabaseAuth');

    const client = initializeSupabaseAuth({
      url: 'https://test.supabase.co',
      anonKey: 'anon',
      serviceRoleKey: 'service',
      cookieName: 'test-cookie',
      persistSession: false,
      autoRefreshToken: false,
    });

    expect(client).toBeTruthy();
  });

  test('throws when configuration invalid', async () => {
    const { initializeSupabaseAuth } = await import('@/src/lib/auth/initializeSupabaseAuth');

    expect(() =>
      initializeSupabaseAuth({ url: '', anonKey: '' }),
    ).toThrow();
  });
});


import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';

// Use dynamic import for the module to ensure env vars are read fresh each time

describe('supabase-auth.config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('loads defaults and validates', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service');

    const mod = await import('@/lib/auth/supabaseAuth.config');
    expect(mod.supabaseAuthConfig.cookieName).toBe('sb-access-token');
    expect(mod.supabaseAuthConfig.autoRefreshToken).toBe(true);
    expect(mod.validateSupabaseAuthConfig()).toBe(true);
  });

  test('validation fails when required env vars are missing', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    const mod = await import('@/lib/auth/supabaseAuth.config');
    expect(mod.validateSupabaseAuthConfig()).toBe(false);
  });
});

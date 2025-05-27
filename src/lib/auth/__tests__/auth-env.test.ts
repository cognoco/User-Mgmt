import { beforeEach, afterEach, describe, expect, test, vi } from 'vitest';

// use dynamic import so env vars are read fresh

describe('authEnvironment', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('loads defaults and validates', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service');

    const mod = await import('../authEnvironment');
    expect(mod.authEnv.sessionCookieName).toBe('user-management-session');
    expect(mod.validateAuthEnv()).toBe(true);
    expect(mod.isSupabaseConfigured()).toBe(true);
    expect(mod.getSupabaseClientConfig()).toEqual({
      url: 'https://test.supabase.co',
      key: 'anon',
    });
  });

  test('validation fails when required env vars are missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    const mod = await import('../authEnvironment');
    expect(mod.validateAuthEnv()).toBe(false);
    expect(mod.isSupabaseConfigured()).toBe(false);
  });
});

import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';

describe('runtime-config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('loads environment variables', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service');

    const mod = await import('../runtime-config');
    const cfg = mod.initializeConfiguration();
    expect(cfg.env.supabaseUrl).toBe('https://test.supabase.co');
    expect(cfg.env.supabaseAnonKey).toBe('anon');
    expect(mod.getClientConfig().env.serviceRoleKey).toBeUndefined();
  });
});

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
    vi.stubEnv('DATABASE_PROVIDER', 'supabase');
    vi.stubEnv('DATABASE_URL', 'supabase://test');
    vi.stubEnv('AUDIT_LOG_RETENTION_DAYS', '90');
    vi.stubEnv('RETENTION_PERSONAL_MONTHS', '24');
    vi.stubEnv('RETENTION_BUSINESS_MONTHS', '36');

    const mod = await import('@/src/core/config/runtimeConfig');
    const cfg = mod.initializeConfiguration();
    expect(cfg.env.supabaseUrl).toBe('https://test.supabase.co');
    expect(cfg.env.supabaseAnonKey).toBe('anon');
    expect(mod.getClientConfig().env.serviceRoleKey).toBeUndefined();
    expect(cfg.env.database.provider).toBe('supabase');
    expect(cfg.env.database.connectionString).toBe('supabase://test');
  });
});

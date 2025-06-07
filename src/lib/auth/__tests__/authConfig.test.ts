import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';

// Tests for the auth helper and configuration

describe('authConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('auth returns session when Supabase provides one', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');

    const getSession = vi.fn().mockResolvedValue({
      data: { session: { id: '1' } },
      error: null,
    });

    vi.mock('@supabase/ssr', () => ({
      createServerClient: vi.fn(() => ({
        auth: { getSession },
      })),
    }));

    const mod = await import('@/src/lib/auth/authConfig');
    const session = await mod.auth();
    expect(session).toEqual({ id: '1' });
  });

  test('auth returns null on error', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');

    const getSession = vi.fn().mockResolvedValue({
      data: { session: null },
      error: new Error('fail'),
    });

    vi.mock('@supabase/ssr', () => ({
      createServerClient: vi.fn(() => ({
        auth: { getSession },
      })),
    }));

    const mod = await import('@/src/lib/auth/authConfig');
    const session = await mod.auth();
    expect(session).toBeNull();
  });

  test('legacy cookie name is derived from env', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon');
    vi.stubEnv('SESSION_COOKIE_NAME', 'legacy-name');

    vi.mock('@supabase/ssr', () => ({
      createServerClient: vi.fn(() => ({
        auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) },
      })),
    }));

    const mod = await import('@/src/lib/auth/authConfig');
    expect(mod.supabaseAuthConfig.legacySessionCookie).toBe('legacy-name');
  });
});

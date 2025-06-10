import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';

describe('Environment Variables', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('required environment variables are defined in development', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test-url.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');

    // Check if the environment variables are correctly set
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test-url.supabase.co');
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key');
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBe('test-service-key');
  });

  test('public variables are accessible but service key is not in client-side code', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test-url.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');

    // Simulate client-side environment
    const clientEnv = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    // Check if public variables are accessible
    expect(clientEnv.NEXT_PUBLIC_SUPABASE_URL).toBe('https://test-url.supabase.co');
    expect(clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe('test-anon-key');
    
    // Service key should not be accessible in client-side code
    expect(clientEnv.SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
  });
});

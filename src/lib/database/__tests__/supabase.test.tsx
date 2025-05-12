import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';

vi.mock('@supabase/supabase-js');

describe('Supabase Client', () => {
  const mockSupabaseUrl = 'https://test.supabase.co';
  const mockSupabaseAnonKey = 'test-anon-key';
  const mockSupabaseServiceKey = 'test-service-key';
  const mockClient = {
    auth: { signIn: vi.fn(), signUp: vi.fn() },
    from: vi.fn(),
    storage: { from: vi.fn() }
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = mockSupabaseUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = mockSupabaseAnonKey;
    process.env.SUPABASE_SERVICE_ROLE_KEY = mockSupabaseServiceKey;
    vi.resetModules();
    (createClient as any).mockReturnValue(mockClient);
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('should create a Supabase client with correct parameters', async () => {
    await import('../supabase');
    expect(createClient).toHaveBeenCalledWith(mockSupabaseUrl, mockSupabaseAnonKey);
  });

  it('should create a service role client with correct parameters', async () => {
    const { getServiceSupabase } = await import('../supabase');
    getServiceSupabase();
    expect(createClient).toHaveBeenCalledWith(mockSupabaseUrl, mockSupabaseServiceKey);
  });

  it('should throw error when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const mod = await import('../supabase');
    expect(() => mod.getServiceSupabase()).toThrow('SUPABASE_SERVICE_ROLE_KEY is not configured.');
  });

  it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const mod = await import('../supabase');
    expect(() => mod.getServiceSupabase()).toThrow('NEXT_PUBLIC_SUPABASE_URL is not configured.');
  });
});

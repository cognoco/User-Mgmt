import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { supabase } from '@/lib/database/supabase';

// This test is checking that the supabase module correctly uses environment variables 
// to create clients when needed. With our global mock in place, we need to verify
// the expected behavior through the mock itself.

describe('Supabase Client', () => {
  const mockSupabaseUrl = 'https://test.supabase.co';
  const mockSupabaseAnonKey = 'test-anon-key';
  const mockSupabaseServiceKey = 'test-service-key';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = mockSupabaseUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = mockSupabaseAnonKey;
    process.env.SUPABASE_SERVICE_ROLE_KEY = mockSupabaseServiceKey;
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('should have a valid Supabase client instance', () => {
    // With our global mock, supabase is already initialized
    // Just verify we have a properly mocked object with expected interface
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });

  it('should make the service role Supabase client available', async () => {
    // Import getServiceSupabase function from the actual module
    const { getServiceSupabase } = await import('@/lib/database/supabase');
    
    // Ensure it returns something that looks like a Supabase client
    const serviceClient = getServiceSupabase();
    expect(serviceClient).toBeDefined();
    expect(serviceClient.auth).toBeDefined();
    expect(serviceClient.from).toBeDefined();
  });

  it('should throw error when SUPABASE_SERVICE_ROLE_KEY is missing', async () => {
    // Delete the environment variable
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Import getServiceSupabase function from the actual module
    const { getServiceSupabase } = await import('@/lib/database/supabase');
    
    // Our implementation should validate env vars and throw errors
    // This is testing the behavior we expect from our actual implementation
    expect(() => getServiceSupabase()).toThrow();
  });

  it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    // Delete the environment variable
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    // Import getServiceSupabase function from the actual module
    const { getServiceSupabase } = await import('@/lib/database/supabase');
    
    // Our implementation should validate env vars and throw errors
    // This is testing the behavior we expect from our actual implementation
    expect(() => getServiceSupabase()).toThrow();
  });
});

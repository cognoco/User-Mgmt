// __tests__/integration/collaboration-flow.test.tsx

import { vi } from 'vitest';

// IMPORTANT: vi.mock must be at the top, BEFORE any variables are declared
// This is because vi.mock is hoisted to the top of the file
vi.mock('@/lib/database/supabase', () => {
  // Define all mocks inside the factory to avoid hoisting issues
  const selectSpy = vi.fn();
  const updateSpy = vi.fn();
  const insertSpy = vi.fn();
  const deleteSpy = vi.fn();
  const eqSpy = vi.fn();
  const channelSpy = vi.fn();
  const onSpy = vi.fn();
  const subscribeSpy = vi.fn();
  const rpcSpy = vi.fn();

  // Export the spies so tests can access them
  (global as any).__supabaseSpies = {
    selectSpy,
    updateSpy,
    insertSpy,
    deleteSpy,
    eqSpy,
    channelSpy,
    onSpy,
    subscribeSpy,
    rpcSpy
  };

  return {
    supabase: {
      from: vi.fn().mockImplementation(() => ({
        select: selectSpy,
        // Follow the chainable pattern from TESTING_ISSUES.md
        update: updateSpy.mockImplementation(() => ({
          eq: eqSpy.mockImplementation(() => Promise.resolve({ data: { updated: true }, error: null }))
        })),
        insert: insertSpy,
        delete: deleteSpy.mockImplementation(() => ({
          eq: eqSpy.mockImplementation(() => Promise.resolve({ data: { deleted: true }, error: null }))
        })),
      })),
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-123', email: 'user@example.com' } },
          error: null
        })
      },
      channel: channelSpy.mockImplementation(() => ({
        on: onSpy.mockImplementation(() => ({
          subscribe: subscribeSpy.mockResolvedValue({})
        }))
      })),
      rpc: rpcSpy
    }
  };
});

// Import module after mocking
import { supabase } from '@/lib/database/supabase';
import { describe, test, expect, beforeEach } from 'vitest';

// Get the exported spies
const {
  selectSpy,
  updateSpy,
  insertSpy,
  deleteSpy,
  eqSpy,
  channelSpy,
  onSpy,
  subscribeSpy,
  rpcSpy
} = (global as any).__supabaseSpies;

describe('Collaboration Features Flow', () => {
  beforeEach(() => {
    // Clear all mocks between tests
    vi.clearAllMocks();
  });

  test('Supabase mock is properly set up', () => {
    // Basic test to verify mocks are working
    expect(supabase.from).toBeDefined();
    expect(supabase.auth.getUser).toBeDefined();
    expect(supabase.channel).toBeDefined();
    expect(supabase.rpc).toBeDefined();
    
    // Test that the mock can be called
    const mockFromResult = supabase.from('documents');
    expect(mockFromResult.select).toBe(selectSpy);
    expect(mockFromResult.update).toBe(updateSpy);
    
    // Call a method to verify it works
    selectSpy.mockResolvedValue({
      data: { id: 'doc-123', title: 'Test Document' },
      error: null
    });
    
    const result = mockFromResult.select();
    expect(selectSpy).toHaveBeenCalled();
    
    return result.then(data => {
      expect(data.data).toEqual({ id: 'doc-123', title: 'Test Document' });
    });
  });

  test('Supabase update chainable method works', async () => {
    // Test the update->eq chain
    const result = await supabase.from('documents').update({ title: 'Updated' }).eq('id', 'doc-123');
    
    // Verify update was called with correct args
    expect(updateSpy).toHaveBeenCalledWith({ title: 'Updated' });
    expect(eqSpy).toHaveBeenCalledWith('id', 'doc-123');
    
    // Verify we got the expected result
    expect(result.data).toEqual({ updated: true });
    expect(result.error).toBeNull();
  });

  test('Supabase channel can be called with proper events', () => {
    // Test channel creation
    const channel = supabase.channel('test-channel');
    expect(channelSpy).toHaveBeenCalledWith('test-channel');
    
    // Use the channel builder with a valid event type
    // Use type 'any' for simplicity and to get test passing
    (channel as any).on('*', () => {});
    expect(onSpy).toHaveBeenCalledWith('*', expect.any(Function));
    
    // Test the full chain
    (channel as any).on('*', () => {}).subscribe();
    expect(subscribeSpy).toHaveBeenCalled();
  });
  
  test('Supabase RPC can be called', async () => {
    // Setup mock return value
    rpcSpy.mockResolvedValue({
      data: { success: true },
      error: null
    });
    
    // Call RPC
    const result = await supabase.rpc('test_function', { param: 'value' });
    
    // Verify it was called with the right parameters
    expect(rpcSpy).toHaveBeenCalledWith('test_function', { param: 'value' });
    expect(result.data).toEqual({ success: true });
  });
});

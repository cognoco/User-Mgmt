// Mock Supabase client using Vitest
import { vi } from 'vitest';

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(), // Correct method name
    signInWithOAuth: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    onAuthStateChange: vi.fn(() => {
      // Return a mock subscription object
      return {
        data: { subscription: { unsubscribe: vi.fn() } },
        error: null,
      };
    }),
    getSession: vi.fn(), // Add missing methods if needed by tests
  },
  // Mock chained methods correctly
  storage: {
    from: vi.fn(() => ({ // Mock storage bucket selection
      upload: vi.fn(),
      download: vi.fn(),
      getPublicUrl: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
      move: vi.fn(),
    })),
  },
  rpc: vi.fn(),
  channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
  })),
  // Mock the query builder methods more robustly
  from: vi.fn(function(table: string): any {
    const self: any = {
      // Ensure chaining methods explicitly return 'self'
      select: vi.fn(() => self),
      insert: vi.fn(() => self),
      update: vi.fn(() => self),
      upsert: vi.fn(() => self), 
      delete: vi.fn(() => self),
      eq: vi.fn(() => self),
      neq: vi.fn(() => self),
      gt: vi.fn(() => self),
      gte: vi.fn(() => self),
      lt: vi.fn(() => self),
      lte: vi.fn(() => self),
      like: vi.fn(() => self),
      ilike: vi.fn(() => self), // Add missing ilike if needed
      in: vi.fn(() => self),
      is: vi.fn(() => self),
      or: vi.fn(() => self),
      filter: vi.fn(() => self),
      range: vi.fn(() => self),
      order: vi.fn(() => self),
      limit: vi.fn(() => self),
      single: vi.fn(() => self),
      maybeSingle: vi.fn(() => self), 
      // Mock terminators to return promises
      then: vi.fn((onfulfilled) => {
        // Simulate promise resolution for terminators
        // You might need more sophisticated logic depending on test needs
        const result = { data: [], error: null }; // Default mock result
        return Promise.resolve(result).then(onfulfilled);
      }),
    };

    // Set default mock resolved values for methods that typically terminate a chain
    // These can be overridden in specific tests using mockResolvedValueOnce etc.
    self.select.mockResolvedValue({ data: [{id: 'mock-select'}], error: null }); 
    self.insert.mockResolvedValue({ data: [{id: 'mock-insert'}], error: null });
    self.update.mockResolvedValue({ data: [{id: 'mock-update'}], error: null });
    self.upsert.mockResolvedValue({ data: [{id: 'mock-upsert'}], error: null });
    self.delete.mockResolvedValue({ data: [{id: 'mock-delete'}], error: null });
    self.single.mockResolvedValue({ data: {id: 'mock-single'}, error: null });
    self.maybeSingle.mockResolvedValue({ data: {id: 'mock-maybeSingle'}, error: null });
    
    // No need for the Object.values loop anymore

    return self;
  })
};

export const supabase = mockSupabase;
// Remove CommonJS export
// module.exports = mockSupabase; 
// __tests__/utils/testing-utils.js

// Use Vitest's vi.fn() for mocking

// Create a robust supabase mock with all chained methods
export const supabase = {
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    mfa: {
      enroll: vi.fn(),
      challenge: vi.fn(),
      verify: vi.fn(),
      listFactors: vi.fn(),
      unenroll: vi.fn(),
    },
  },
  from: vi.fn((_: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    then: vi.fn(),
  })),
  storage: {
    from: vi.fn((_: string) => ({
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: '' } }),
      download: vi.fn().mockResolvedValue({ data: null, error: null }),
      remove: vi.fn().mockResolvedValue({ data: null, error: null }),
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
  rpc: vi.fn(),
};

// Optionally, replace the real supabase import with the mock in test environments
vi.mock('../../lib/supabase', () => ({ supabase }));

/**
 * Creates a mock user with customizable properties
 * @param {Object} overrides - Custom properties to override defaults
 * @returns {Object} A mock user object
 */
export function createMockUser(overrides: any = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'authenticated',
    app_metadata: { role: 'user' },
    ...overrides
  };
}

/**
 * Creates a mock admin user with customizable properties
 * @param {Object} overrides - Custom properties to override defaults
 * @returns {Object} A mock admin user object
 */
export function createMockAdminUser(overrides: any = {}) {
  return createMockUser({
    id: 'admin-user-id',
    email: 'admin@example.com',
    app_metadata: { role: 'admin' },
    ...overrides
  });
}

/**
 * Creates a mock profile with customizable properties
 * @param {Object} overrides - Custom properties to override defaults
 * @returns {Object} A mock profile object
 */
export function createMockProfile(overrides: any = {}) {
  return {
    id: 'test-user-id',
    full_name: 'Test User',
    website: 'https://example.com',
    avatar_url: 'https://example.com/avatar.jpg',
    ...overrides
  };
}

/**
 * Configures supabase mock for authentication
 * @param {Object} user - User object to return from getUser
 * @param {Object|null} error - Optional error to return
 */
export function mockAuthentication(user: any, error: any = null) {
  supabase.auth.getUser.mockResolvedValue({
    data: { user },
    error
  });
}

/**
 * Mocks a successful database operation
 * @param {string} table - Table name
 * @param {Object|Array} data - Data to return
 * @param {string} operation - Operation type (select, insert, update, etc.)
 */
export function mockDatabaseSuccess(table: any, data: any, operation: any = 'select') {
  const mockResponse = { data, error: null };
  
  // For operations that return a single item
  if (['single', 'maybeSingle'].includes(operation)) {
    (supabase as any).single.mockResolvedValue(mockResponse);
    (supabase as any).maybeSingle?.mockResolvedValue(mockResponse);
    return;
  }
  
  // For regular query operations
  const mock = (supabase.from(table) as any);
  
  if (operation === 'select') {
    mock.select.mockResolvedValue(mockResponse);
  } else if (operation === 'insert') {
    mock.insert.mockResolvedValue(mockResponse);
  } else if (operation === 'update') {
    mock.update.mockResolvedValue(mockResponse);
  } else if (operation === 'upsert') {
    mock.upsert.mockResolvedValue(mockResponse);
  } else if (operation === 'delete') {
    mock.delete.mockResolvedValue(mockResponse);
  }
}

/**
 * Mocks a database error
 * @param {string} table - Table name
 * @param {string} message - Error message
 * @param {string} operation - Operation type (select, insert, update, etc.)
 * @param {number} code - Error code
 */
export function mockDatabaseError(table: any, message: any, operation: any = 'select', code: any = 500) {
  const error = { message, code };
  const mockResponse = { data: null, error };
  
  // For operations that return a single item
  if (['single', 'maybeSingle'].includes(operation)) {
    (supabase as any).single.mockResolvedValue(mockResponse);
    (supabase as any).maybeSingle?.mockResolvedValue(mockResponse);
    return;
  }
  
  // For regular query operations
  const mock = (supabase.from(table) as any);
  
  if (operation === 'select') {
    mock.select.mockResolvedValue(mockResponse);
  } else if (operation === 'insert') {
    mock.insert.mockResolvedValue(mockResponse);
  } else if (operation === 'update') {
    mock.update.mockResolvedValue(mockResponse);
  } else if (operation === 'upsert') {
    mock.upsert.mockResolvedValue(mockResponse);
  } else if (operation === 'delete') {
    mock.delete.mockResolvedValue(mockResponse);
  }
}

/**
 * Mocks storage operations
 * @param {string} bucket - Bucket name
 * @param {Object} responses - Object containing responses for different operations
 */
export function mockStorage(bucket: any, responses: any = {}) {
  const defaultResponses = {
    upload: { data: { path: 'test-path.jpg' }, error: null },
    getPublicUrl: { data: { publicUrl: 'https://example.com/test.jpg' } },
    download: { data: new Blob(), error: null },
    remove: { data: { path: 'test-path.jpg' }, error: null },
    list: { data: [], error: null }
  };
  
  const mockResponses = { ...defaultResponses, ...responses };
  const mockBucket = (supabase.storage.from(bucket) as any);
  
  // Configure mock responses
  Object.entries(mockResponses).forEach(([operation, response]) => {
    if (operation === 'getPublicUrl') {
      mockBucket.getPublicUrl.mockReturnValue(response);
    } else {
      mockBucket[operation].mockResolvedValue(response);
    }
  });
}

/**
 * Clears all mocks and sets up common mock responses
 */
export function setupMocks() {
  // Clear all mocks
  vi.clearAllMocks();
  
  // Set up default responses
  mockAuthentication(null);
  (supabase as any).from.mockReturnThis();
  (supabase as any).select.mockReturnThis();
  (supabase.storage.from as any).mockReturnValue();
}

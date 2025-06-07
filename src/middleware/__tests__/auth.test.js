// __tests__/middleware/auth.test.js

import { createMocks } from 'node-mocks-http';
import { withAuth } from '@/src/middleware/auth';
import { describe, test, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';

// Mock auth service
const mockAuthService = { getSession: vi.fn(), getUser: vi.fn() };
vi.mock('@/services/auth/factory', () => ({
  getApiAuthService: () => mockAuthService,
}));

// Import utility functions
import { setupTestEnvironment } from '@/src/tests/utils/environmentSetup';
import { createMockUser, createMockAdminUser } from '@/src/tests/utils/testingUtils';

describe('Auth Middleware', () => {
  // Setup test environment
  let cleanup;
  
  beforeAll(() => {
    cleanup = setupTestEnvironment();
  });
  
  afterAll(() => {
    if (cleanup) cleanup();
  });
  
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  test('allows authenticated requests to proceed', async () => {
    // Use our utility to create a mock user
    const mockUser = createMockUser();
    
    // Mock authenticated user with exact structure expected by the middleware
    mockAuthService.getSession.mockResolvedValue({ user: mockUser });

    // Create a mock handler that the middleware will wrap
    const handler = vi.fn().mockImplementation((req, res) => {
      res.status(200).json({ success: true });
    });

    // Create the wrapped handler
    const protectedHandler = withAuth(handler);

    // Create mock request and response
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    // Call the protected handler
    await protectedHandler(req, res);

    // Check if the handler was called
    expect(handler).toHaveBeenCalled();
    
    // Check if the response is correct
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ success: true });
    
    // Check if the user was added to the request with the correct structure
    expect(req.user).toEqual(mockUser);
    
    // Verify Supabase was called with the right token
    expect(mockAuthService.getSession).toHaveBeenCalledWith('valid-token');
  });

  test('rejects requests without authorization header', async () => {
    // Create a mock handler that the middleware will wrap
    const handler = vi.fn().mockImplementation((req, res) => {
      res.status(200).json({ success: true });
    });

    // Create the wrapped handler
    const protectedHandler = withAuth(handler);

    // Create mock request and response without auth header
    const { req, res } = createMocks({
      method: 'GET',
    });

    // Call the protected handler
    await protectedHandler(req, res);

    // Check if the handler was NOT called
    expect(handler).not.toHaveBeenCalled();
    
    // Check if the response is correct (401 Unauthorized)
    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: {
        code: 'AUTH_ACCESS_001',
        message: 'Authentication required',
        category: 'auth'
      }
    });
  });

  test('rejects requests with invalid token', async () => {
    // Mock auth error with exact structure expected by the middleware
    mockAuthService.getSession.mockResolvedValue(null);

    // Create a mock handler that the middleware will wrap
    const handler = vi.fn().mockImplementation((req, res) => {
      res.status(200).json({ success: true });
    });

    // Create the wrapped handler
    const protectedHandler = withAuth(handler);

    // Create mock request and response with invalid token
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer invalid-token',
      },
    });

    // Call the protected handler
    await protectedHandler(req, res);

    // Check if the handler was NOT called
    expect(handler).not.toHaveBeenCalled();
    
    // Check if the response is correct (401 Unauthorized)
    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: {
        code: 'AUTH_ACCESS_001',
        message: 'Invalid authentication token',
        category: 'auth'
      }
    });

    // Verify service was called with the right token
    expect(mockAuthService.getSession).toHaveBeenCalledWith('invalid-token');
  });

  test('handles server errors during authentication', async () => {
    // Mock server error
    mockAuthService.getSession.mockRejectedValue(new Error('Server error'));

    // Create a mock handler that the middleware will wrap
    const handler = vi.fn().mockImplementation((req, res) => {
      res.status(200).json({ success: true });
    });

    // Create the wrapped handler
    const protectedHandler = withAuth(handler);

    // Create mock request and response
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    // Call the protected handler
    await protectedHandler(req, res);

    // Check if the handler was NOT called
    expect(handler).not.toHaveBeenCalled();
    
    // Check if the response is correct (500 Server Error)
    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: {
        code: 'SERVER_GENERAL_001',
        message: 'Server error',
        category: 'server'
      }
    });
  });

  test('checks for admin role when required', async () => {
    // Use our utility to create a mock admin user
    const mockAdminUser = createMockAdminUser();
    
    // Mock authenticated user with admin role
    mockAuthService.getSession.mockResolvedValue({ user: mockAdminUser });

    // Create a mock handler that the middleware will wrap
    const handler = vi.fn().mockImplementation((req, res) => {
      res.status(200).json({ success: true });
    });

    // Create the wrapped handler with admin requirement
    const protectedHandler = withAuth(handler, { requireAdmin: true });

    // Create mock request and response
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    // Call the protected handler
    await protectedHandler(req, res);

    // Check if the handler was called
    expect(handler).toHaveBeenCalled();
    
    // Check if the response is correct
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ success: true });
  });

  test('rejects non-admin users when admin is required', async () => {
    // Use our utility to create a regular user
    const mockUser = createMockUser();
    
    // Mock authenticated user without admin role
    mockAuthService.getSession.mockResolvedValue({ user: mockUser });

    // Create a mock handler that the middleware will wrap
    const handler = vi.fn().mockImplementation((req, res) => {
      res.status(200).json({ success: true });
    });

    // Create the wrapped handler with admin requirement
    const protectedHandler = withAuth(handler, { requireAdmin: true });

    // Create mock request and response
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-token',
      },
    });

    // Call the protected handler
    await protectedHandler(req, res);

    // Check if the handler was NOT called
    expect(handler).not.toHaveBeenCalled();
    
    // Check if the response is correct (403 Forbidden)
    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toEqual({
      error: {
        code: 'AUTH_ACCESS_002',
        message: 'Insufficient permissions',
        category: 'auth'
      }
    });
  });
  
  test('correctly extracts token from different authorization formats', async () => {
    // Test cases for different authorization header formats
    const testCases = [
      { header: 'Bearer token123', expectedToken: 'token123' },
      { header: 'token123', expectedToken: 'token123' }
    ];
    
    for (const testCase of testCases) {
      // Clear mocks before each test case
      vi.clearAllMocks();
      
      // Create a mock user
      const mockUser = createMockUser();
      
      // Mock authenticated user
      mockAuthService.getSession.mockResolvedValue({ user: mockUser });
      
      const handler = vi.fn().mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });
      
      const protectedHandler = withAuth(handler);
      
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          authorization: testCase.header,
        },
      });
      
      await protectedHandler(req, res);
      
      // Extract the token the same way the auth middleware does
      const expectedToken = testCase.header.startsWith('Bearer ') 
        ? testCase.header.split(' ')[1]
        : testCase.header;
      
      // Verify the token was extracted correctly
      expect(mockAuthService.getSession).toHaveBeenCalledWith(expectedToken);
      expect(handler).toHaveBeenCalled();
    }
  });
});

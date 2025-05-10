import { createMocks } from 'node-mocks-http';
import usersHandler from '../../../../pages/api/admin/users';
import { describe, test, expect, beforeEach, vi } from 'vitest';

// Import and use our standardized mock
vi.mock('../../../../lib/supabase', () => require('../../../__mocks__/supabase'));
import { getServiceSupabase } from '../../../../lib/supabase';

describe('Admin Users API', () => {
  const mockUsers = [
    { id: '1', email: 'user1@example.com' },
    { id: '2', email: 'user2@example.com' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Configure the mock for this test suite
    getServiceSupabase.mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: mockUsers,
        error: null,
      }),
    }));
  });

  test('should return users list for GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await usersHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      users: mockUsers,
    });
    expect(getServiceSupabase).toHaveBeenCalled();
  });

  test('should return 405 for non-GET requests', async () => {
    const methods = ['POST', 'PUT', 'DELETE', 'PATCH'];

    for (const method of methods) {
      const { req, res } = createMocks({
        method,
        headers: {
          authorization: 'Bearer test-token',
        },
      });

      await usersHandler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Method not allowed',
      });
      expect(getServiceSupabase).not.toHaveBeenCalled();
    }
  });

  test('should return 401 when authorization header is missing', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await usersHandler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Unauthorized',
    });
    expect(getServiceSupabase).not.toHaveBeenCalled();
  });

  test('should handle Supabase errors', async () => {
    getServiceSupabase.mockImplementationOnce(() => ({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      }),
    }));

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await usersHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Error fetching users',
    });
  });

  test('should return an empty array if no users found', async () => {
    getServiceSupabase.mockImplementationOnce(() => ({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    }));

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await usersHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      users: [],
    });
  });

  test('should handle errors gracefully', async () => {
    getServiceSupabase.mockImplementationOnce(() => ({
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      }),
    }));

    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer test-token',
      },
    });

    await usersHandler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Error fetching users',
    });
  });
});

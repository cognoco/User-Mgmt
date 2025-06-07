import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/users/search/route';

// Mock the permission system
vi.mock('@/middleware/permissions', () => ({
  createProtectedHandler: vi.fn((handler: any, permission: string) => {
    // Return a function that bypasses permission checking and calls the handler directly
    return async (req: NextRequest) => {
      // Create a mock auth context
      const mockContext = {
        userId: 'test-user-id',
        user: { id: 'test-user-id', role: 'ADMIN' },
        role: 'ADMIN'
      };
      return handler(req, mockContext);
    };
  })
}));

vi.mock('@/services/admin/factory', () => ({
  getApiAdminService: vi.fn(),
}));

import { getApiAdminService } from '@/services/admin/factory';

function createRequest(query: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/admin/users/search');
  Object.entries(query).forEach(([k, v]) => url.searchParams.append(k, v));
  return { 
    method: 'GET', 
    url: url.toString(),
    nextUrl: { searchParams: new URLSearchParams(query) }
  } as unknown as NextRequest;
}

describe('admin search API', () => {
  const service = { searchUsers: vi.fn() } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getApiAdminService).mockReturnValue(service);
    service.searchUsers.mockResolvedValue({ 
      users: [], 
      pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 } 
    });
  });

  it('calls service with parsed params', async () => {
    const res = await GET(createRequest({ query: 'john' }));
    expect(res.status).toBe(200);
    expect(service.searchUsers).toHaveBeenCalled();
  });
});

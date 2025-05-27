import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

vi.mock('@/services/admin/factory', () => ({
  getApiAdminService: vi.fn(),
}));

import { getApiAdminService } from '@/services/admin/factory';

function createRequest(query: Record<string, string> = {}) {
  const url = new URL('http://localhost/api/admin/users/search');
  Object.entries(query).forEach(([k, v]) => url.searchParams.append(k, v));
  return { method: 'GET', url: url.toString() } as unknown as NextRequest;
}

describe('admin search API', () => {
  const service = { searchUsers: vi.fn() } as any;

  beforeEach(() => {
    vi.mocked(getApiAdminService).mockReturnValue(service);
    service.searchUsers.mockResolvedValue({ users: [], pagination: { page: 1, limit: 10, totalCount: 0, totalPages: 0 } });
  });

  it('calls service with parsed params', async () => {
    const res = await GET(createRequest({ query: 'john' }));
    expect(res.status).toBe(200);
    expect(service.searchUsers).toHaveBeenCalled();
  });
});

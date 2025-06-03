import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

vi.mock('@/lib/database/supabase', () => ({
  getServiceSupabase: vi.fn(),
}));
vi.mock('@/middleware/createMiddlewareChain', async () => {
  const actual = await vi.importActual<any>('@/middleware/createMiddlewareChain');
  return {
    ...actual,
    routeAuthMiddleware: () => (handler: any) =>
      (req: any, ctx?: any, data?: any) =>
        handler(req, { userId: 'u1', role: 'admin', permissions: ['admin.users.list'] }, data),
    validationMiddleware: () => (handler: any) =>
      (req: any, ctx?: any) => {
        // Extract query parameters for validation middleware
        const url = new URL(req.url);
        const params = {
          page: parseInt(url.searchParams.get('page') || '1'),
          limit: parseInt(url.searchParams.get('limit') || '20'), 
          search: url.searchParams.get('search') || '',
          sortBy: url.searchParams.get('sortBy') || 'createdAt',
          sortOrder: url.searchParams.get('sortOrder') || 'desc'
        };
        return handler(req, ctx, params);
      },
    errorHandlingMiddleware: () => (handler: any) => handler,
  };
});

import { getServiceSupabase } from '@/lib/database/supabase';

function createRequest(query: Record<string, string> = {}) {
  const url = new URL('https://example.com/api/admin/users');
  Object.entries(query).forEach(([k, v]) => url.searchParams.append(k, v));
  
  return {
    method: 'GET',
    url: url.toString(),
    nextUrl: { 
      pathname: '/api/admin/users',
      searchParams: url.searchParams
    },
    json: vi.fn().mockResolvedValue({}),
    get headers() {
      const headersMap = new Map([
        ['x-forwarded-for', '127.0.0.1'],
        ['user-agent', 'test-agent']
      ]);
      return {
        get: (key: string) => headersMap.get(key.toLowerCase()) || null
      };
    }
  } as unknown as NextRequest;
}

describe('Admin Users API', () => {
  let supabaseMock: any;

  beforeEach(() => {
    vi.useFakeTimers();
    supabaseMock = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn(),
    };
    (getServiceSupabase as any).mockReturnValue(supabaseMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns paginated users', async () => {
    supabaseMock.range.mockResolvedValue({ data: [{ id: '1' }], error: null, count: 1 });

    const res = await GET(createRequest({ page: '1', limit: '10' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.users).toHaveLength(1);
    expect(body.pagination.total).toBe(1);
    expect(supabaseMock.from).toHaveBeenCalledWith('users');
  });

  it('applies search filter', async () => {
    supabaseMock.range.mockResolvedValue({ data: [], error: null, count: 0 });
    await GET(createRequest({ search: 'john' }));
    expect(supabaseMock.or).toHaveBeenCalledWith(
      'email.ilike.%john%,first_name.ilike.%john%,last_name.ilike.%john%'
    );
  });

  it('returns 500 on database error', async () => {
    supabaseMock.range.mockResolvedValue({ data: null, error: new Error('fail'), count: null });
    const res = await GET(createRequest());
    expect(res.status).toBe(500);
  });

  it('returns 504 on timeout', async () => {
    // Mock Promise.race to immediately reject with timeout error
    const originalPromiseRace = Promise.race;
    Promise.race = vi.fn().mockRejectedValue(new Error('Database query timeout'));
    
    supabaseMock.range.mockResolvedValue({ data: [], error: null, count: 0 });
    const res = await GET(createRequest());
    expect(res.status).toBe(504);
    
    // Restore original Promise.race
    Promise.race = originalPromiseRace;
  }, 1000); // Set shorter timeout for test itself
});

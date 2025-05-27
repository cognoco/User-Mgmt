import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../route';

vi.mock('@/lib/database/supabase', () => ({
  getServiceSupabase: vi.fn(),
}));

import { getServiceSupabase } from '@/lib/database/supabase';

function createRequest(query: Record<string, string> = {}) {
  const url = new URL('https://example.com/api/admin/users');
  Object.entries(query).forEach(([k, v]) => url.searchParams.append(k, v));
  return { method: 'GET', url: url.toString() } as unknown as NextRequest;
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
    supabaseMock.range.mockImplementation(() => new Promise(() => {}));
    const promise = GET(createRequest());
    vi.advanceTimersByTime(5000);
    const res = await promise;
    expect(res.status).toBe(504);
  });
});

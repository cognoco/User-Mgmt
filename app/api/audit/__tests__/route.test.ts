import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GET } from '../route';
import { withRouteAuth } from '@/middleware/auth';
import { hasPermission } from '@/lib/auth/hasPermission';
import { setTableMockData, resetSupabaseMock } from '@/tests/mocks/supabase';
import { NextResponse } from 'next/server';
import { createAuthenticatedRequest } from '@/tests/utils/request-helpers';

vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any) => async (req: any) => handler(req, { userId: 'u1', role: 'user' })),
}));
vi.mock('@/lib/auth/hasPermission', () => ({
  hasPermission: vi.fn(),
}));

describe('GET /api/audit', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    resetSupabaseMock();
    (hasPermission as unknown as vi.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    resetSupabaseMock();
  });

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(withRouteAuth).mockResolvedValueOnce(new NextResponse('unauth', { status: 401 }));
    const res = await GET(createAuthenticatedRequest('GET', 'http://localhost/api/audit'));
    expect(res.status).toBe(401);
  });

  it('validates query parameters', async () => {
    const res = await GET(createAuthenticatedRequest('GET', 'http://localhost/api/audit?page=bad'));
    expect(res.status).toBe(400);
  });

  it('checks permissions when requesting another user', async () => {
    (hasPermission as unknown as vi.Mock).mockResolvedValue(false);
    const res = await GET(createAuthenticatedRequest('GET', 'http://localhost/api/audit?userId=u2'));
    expect(res.status).toBe(403);
  });

  it('returns logs from database', async () => {
    setTableMockData('user_actions_log', {
      data: [{ id: '1', created_at: '2023-01-01', user_id: 'u1', action: 'LOGIN', status: 'SUCCESS' }],
      error: null,
    });

    const res = await GET(createAuthenticatedRequest('GET', 'http://localhost/api/audit?page=1&limit=10'));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.logs.length).toBe(1);
    expect(data.pagination.total).toBe(1);
  });
});

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GET } from '../route';
import { getUserFromRequest } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/auth/hasPermission';
import { setTableMockData, resetSupabaseMock } from '@/tests/mocks/supabase';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth/utils', () => ({
  getUserFromRequest: vi.fn(),
}));
vi.mock('@/lib/auth/hasPermission', () => ({
  hasPermission: vi.fn(),
}));

describe('GET /api/audit', () => {
  const createRequest = (url: string) => new NextRequest(url);

  beforeEach(() => {
    vi.clearAllMocks();
    resetSupabaseMock();
    (hasPermission as unknown as vi.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    resetSupabaseMock();
  });

  it('returns 401 when unauthenticated', async () => {
    (getUserFromRequest as unknown as vi.Mock).mockResolvedValue(null);
    const res = await GET(createRequest('http://localhost/api/audit'));
    expect(res.status).toBe(401);
  });

  it('validates query parameters', async () => {
    (getUserFromRequest as unknown as vi.Mock).mockResolvedValue({ id: 'u1' });
    const res = await GET(createRequest('http://localhost/api/audit?page=bad'));
    expect(res.status).toBe(400);
  });

  it('checks permissions when requesting another user', async () => {
    (getUserFromRequest as unknown as vi.Mock).mockResolvedValue({ id: 'u1' });
    (hasPermission as unknown as vi.Mock).mockResolvedValue(false);
    const res = await GET(createRequest('http://localhost/api/audit?userId=u2'));
    expect(res.status).toBe(403);
  });

  it('returns logs from database', async () => {
    (getUserFromRequest as unknown as vi.Mock).mockResolvedValue({ id: 'u1' });
    setTableMockData('user_actions_log', {
      data: [{ id: '1', created_at: '2023-01-01', user_id: 'u1', action: 'LOGIN', status: 'SUCCESS' }],
      error: null,
    });

    const res = await GET(createRequest('http://localhost/api/audit?page=1&limit=10'));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.logs.length).toBe(1);
    expect(data.pagination.total).toBe(1);
  });
});

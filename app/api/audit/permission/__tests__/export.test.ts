import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@app/api/audit/permission/export/route';
import { withRouteAuth } from '@/middleware/auth';
import { setTableMockData, resetSupabaseMock } from '@/tests/mocks/supabase';
import { NextResponse } from 'next/server';
import { createAuthenticatedRequest } from '@/tests/utils/requestHelpers';

vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any) => async (req: any) => handler(req, { userId: 'u1' }))
}));

beforeEach(() => {
  vi.clearAllMocks();
  resetSupabaseMock();
});

describe('GET /api/audit/permission/export', () => {
  it('returns 401 when unauthenticated', async () => {
    vi.mocked(withRouteAuth).mockResolvedValueOnce(new NextResponse('unauth', { status: 401 }));
    const res = await GET(createAuthenticatedRequest('GET', 'http://localhost/api/audit/permission/export', undefined, null));
    expect(res.status).toBe(401);
  });

  it('validates query parameters', async () => {
    const res = await GET(createAuthenticatedRequest('GET', 'http://localhost/api/audit/permission/export?format=bad'));
    expect(res.status).toBe(400);
  });

  it('exports logs', async () => {
    setTableMockData('user_actions_log', {
      data: [
        { id: '1', created_at: '2023-01-01', user_id: 'u1', action: 'PERMISSION_ADDED', target_resource_type: 'permission' }
      ],
      error: null
    });
    const res = await GET(createAuthenticatedRequest('GET', 'http://localhost/api/audit/permission/export?format=json'));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Disposition')).toBe('attachment; filename="audit-logs.json"');
  });
});

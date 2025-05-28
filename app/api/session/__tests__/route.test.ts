import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, DELETE } from '../route';
import { withRouteAuth } from '@/middleware/auth';
import { createSessionProvider } from '@/adapters/session/factory';
import { createAuthenticatedRequest } from '@/tests/utils/request-helpers';

vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any) => async (req: any) => handler(req, { userId: 'user-1', role: 'user' })),
}));

vi.mock('@/adapters/session/factory', () => ({
  createSessionProvider: vi.fn(),
}));

interface MockProvider {
  listUserSessions?: vi.Mock;
  deleteAllUserSessions?: vi.Mock;
}

describe('/api/session', () => {
  const user = { id: 'user-1', email: 'test@example.com' };
  let provider: MockProvider;

  beforeEach(() => {
    provider = {
      listUserSessions: vi.fn().mockResolvedValue([]),
      deleteAllUserSessions: vi.fn().mockResolvedValue({ success: true, count: 0 }),
    };
    (createSessionProvider as unknown as vi.Mock).mockReturnValue(provider);
  });

  it('GET returns sessions for authenticated user', async () => {
    provider.listUserSessions!.mockResolvedValue([{ id: '1' }]);
    const res = await GET(createAuthenticatedRequest('GET', 'http://localhost/api/session'));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.sessions.length).toBe(1);
    expect(provider.listUserSessions).toHaveBeenCalledWith('user-1');
  });

  it('GET returns 401 for unauthenticated user', async () => {
    vi.mocked(withRouteAuth).mockResolvedValueOnce(new NextResponse('unauth', { status: 401 }));
    const res = await GET(createAuthenticatedRequest('GET', 'http://localhost/api/session'));
    expect(res.status).toBe(401);
  });

  it('GET returns 500 on provider error', async () => {
    provider.listUserSessions!.mockRejectedValue(new Error('fail'));
    const res = await GET(createAuthenticatedRequest('GET', 'http://localhost/api/session'));
    expect(res.status).toBe(500);
  });

  it('DELETE revokes all sessions for authenticated user', async () => {
    provider.deleteAllUserSessions!.mockResolvedValue({ success: true, count: 2 });
    const res = await DELETE(createAuthenticatedRequest('DELETE', 'http://localhost/api/session'));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(provider.deleteAllUserSessions).toHaveBeenCalledWith('user-1');
  });

  it('DELETE returns 401 for unauthenticated user', async () => {
    vi.mocked(withRouteAuth).mockResolvedValueOnce(new NextResponse('unauth', { status: 401 }));
    const res = await DELETE(createAuthenticatedRequest('DELETE', 'http://localhost/api/session'));
    expect(res.status).toBe(401);
  });

  it('DELETE returns 500 on provider error', async () => {
    provider.deleteAllUserSessions!.mockRejectedValue(new Error('fail'));
    const res = await DELETE(createAuthenticatedRequest('DELETE', 'http://localhost/api/session'));
    expect(res.status).toBe(500);
  });
});

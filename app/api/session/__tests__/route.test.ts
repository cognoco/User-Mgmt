import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, DELETE } from '../route';
import { getUserFromRequest } from '@/lib/auth/utils';
import { createSessionProvider } from '@/adapters/session/factory';

vi.mock('@/lib/auth/utils', () => ({
  getUserFromRequest: vi.fn(),
}));

vi.mock('@/adapters/session/factory', () => ({
  createSessionProvider: vi.fn(),
}));

interface MockProvider {
  listUserSessions?: vi.Mock;
  deleteAllUserSessions?: vi.Mock;
}

function mockRequest(method: string) {
  return { method, headers: {}, json: vi.fn() } as any;
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
    (getUserFromRequest as vi.Mock).mockResolvedValue(user);
    provider.listUserSessions!.mockResolvedValue([{ id: '1' }]);
    const res = await GET(mockRequest('GET'));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.sessions.length).toBe(1);
    expect(provider.listUserSessions).toHaveBeenCalledWith('user-1');
  });

  it('GET returns 401 for unauthenticated user', async () => {
    (getUserFromRequest as vi.Mock).mockResolvedValue(null);
    const res = await GET(mockRequest('GET'));
    expect(res.status).toBe(401);
  });

  it('GET returns 500 on provider error', async () => {
    (getUserFromRequest as vi.Mock).mockResolvedValue(user);
    provider.listUserSessions!.mockRejectedValue(new Error('fail'));
    const res = await GET(mockRequest('GET'));
    expect(res.status).toBe(500);
  });

  it('DELETE revokes all sessions for authenticated user', async () => {
    (getUserFromRequest as vi.Mock).mockResolvedValue(user);
    provider.deleteAllUserSessions!.mockResolvedValue({ success: true, count: 2 });
    const res = await DELETE(mockRequest('DELETE'));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(provider.deleteAllUserSessions).toHaveBeenCalledWith('user-1');
  });

  it('DELETE returns 401 for unauthenticated user', async () => {
    (getUserFromRequest as vi.Mock).mockResolvedValue(null);
    const res = await DELETE(mockRequest('DELETE'));
    expect(res.status).toBe(401);
  });

  it('DELETE returns 500 on provider error', async () => {
    (getUserFromRequest as vi.Mock).mockResolvedValue(user);
    provider.deleteAllUserSessions!.mockRejectedValue(new Error('fail'));
    const res = await DELETE(mockRequest('DELETE'));
    expect(res.status).toBe(500);
  });
});

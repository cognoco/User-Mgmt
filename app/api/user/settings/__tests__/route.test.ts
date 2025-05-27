import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PATCH } from '../route';
import { getApiUserService } from '@/services/user/factory';
import { withRouteAuth } from '@/middleware/auth';
import createMockUserService from '@/tests/mocks/user.service.mock';

vi.mock('@/services/user/factory', () => ({ getApiUserService: vi.fn() }));
vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any, req: any) => handler(req, 'user-1')),
}));

const service = createMockUserService();

beforeEach(() => {
  vi.clearAllMocks();
  (getApiUserService as unknown as vi.Mock).mockReturnValue(service);
});

describe('/api/user/settings GET', () => {
  it('returns user settings', async () => {
    const req = new NextRequest('http://localhost/api/user/settings');
    const res = await GET(req as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.notifications.email).toBe(true);
    expect(service.getUserPreferences).toHaveBeenCalledWith('user-1');
  });
});

describe('/api/user/settings PATCH', () => {
  it('updates user settings', async () => {
    const req = new NextRequest('http://localhost/api/user/settings', {
      method: 'PATCH',
      body: JSON.stringify({ notifications: { email: false } }),
    });
    (req as any).json = async () => ({ notifications: { email: false } });
    const res = await PATCH(req as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(service.updateUserPreferences).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        notifications: expect.objectContaining({ email: false }),
      })
    );
    expect(body.data.notifications.email).toBe(true); // from mock
  });

  it('returns 500 on failure', async () => {
    (service.updateUserPreferences as vi.Mock).mockResolvedValueOnce({ success: false, error: 'fail' });
    const req = new NextRequest('http://localhost/api/user/settings', {
      method: 'PATCH',
      body: JSON.stringify({ notifications: { email: false } }),
    });
    (req as any).json = async () => ({ notifications: { email: false } });
    const res = await PATCH(req as any);
    expect(res.status).toBe(500);
  });
});

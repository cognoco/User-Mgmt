import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PATCH } from '../route';
import { getApiUserService } from '@/services/user/factory';
import { withAuthRequest } from '@/middleware/auth';
import createMockUserService from '@/tests/mocks/user.service.mock';

vi.mock('@/services/user/factory', () => ({ getApiUserService: vi.fn() }));
vi.mock('@/middleware/auth', () => ({
  withAuthRequest: vi.fn((req: any, handler: any) => handler(req, { userId: 'user-1', role: 'user' })),
}));

const service = createMockUserService();

beforeEach(() => {
  vi.clearAllMocks();
  (getApiUserService as unknown as vi.Mock).mockReturnValue(service);
});

describe('/api/user/profile GET', () => {
  it('returns user profile', async () => {
    const req = new NextRequest('http://localhost/api/user/profile');
    const res = await GET(req as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(service.getUserProfile).toHaveBeenCalledWith('user-1');
    expect(data.data.id).toBe('user-1');
  });

  it('returns 404 when profile missing', async () => {
    (service.getUserProfile as vi.Mock).mockResolvedValueOnce(null);
    const req = new NextRequest('http://localhost/api/user/profile');
    const res = await GET(req as any);
    expect(res.status).toBe(404);
  });
});

describe('/api/user/profile PATCH', () => {
  it('updates user profile', async () => {
    const req = new NextRequest('http://localhost/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify({ bio: 'Updated bio' }),
    });
    (req as any).json = async () => ({ bio: 'Updated bio' });
    const res = await PATCH(req as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(service.updateUserProfile).toHaveBeenCalledWith('user-1', {
      bio: 'Updated bio',
    });
    expect(data.data.bio).toBe('Updated bio');
  });

  it('returns 500 when update fails', async () => {
    (service.updateUserProfile as vi.Mock).mockResolvedValueOnce({ success: false, error: 'fail' });
    const req = new NextRequest('http://localhost/api/user/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name: 'Bad' }),
    });
    (req as any).json = async () => ({ name: 'Bad' });
    const res = await PATCH(req as any);
    expect(res.status).toBe(500);
  });
});

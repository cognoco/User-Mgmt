import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '../route';
import { getApiUserService } from '@/services/user/factory';
import { withAuthRequest } from '@/middleware/auth';
import createMockUserService from '@/tests/mocks/user.service.mock';

vi.mock('@/services/user/factory', () => ({ getApiUserService: vi.fn() }));
vi.mock('@/middleware/auth', () => ({
  withAuthRequest: vi.fn((req: any, handler: any) => handler(req, { userId: 'user-1', role: 'user', permissions: [] })),
}));

const service = createMockUserService();

beforeEach(() => {
  vi.clearAllMocks();
  (getApiUserService as unknown as vi.Mock).mockReturnValue(service);
});

describe('/api/user/avatar alias', () => {
  it('returns predefined avatars', async () => {
    const req = new NextRequest('http://localhost/api/user/avatar');
    const res = await GET(req as any);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(body.data.avatars)).toBe(true);
  });

  it('updates avatar using predefined id', async () => {
    const req = new NextRequest('http://localhost/api/user/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatarId: 'avatar1' }),
    });
    (req as any).json = async () => ({ avatarId: 'avatar1' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(service.updateUserProfile).toHaveBeenCalled();
  });

  it('uploads custom avatar', async () => {
    const data = 'data:image/png;base64,aGVsbG8=';
    const req = new NextRequest('http://localhost/api/user/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatar: data }),
    });
    (req as any).json = async () => ({ avatar: data });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(service.uploadProfilePicture).toHaveBeenCalled();
  });

  it('deletes avatar', async () => {
    const req = new NextRequest('http://localhost/api/user/avatar', { method: 'DELETE' });
    const res = await DELETE(req as any);
    expect(res.status).toBe(204);
    expect(service.deleteProfilePicture).toHaveBeenCalled();
  });
});

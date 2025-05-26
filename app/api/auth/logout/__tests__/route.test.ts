import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { getApiAuthService } from '@/services/auth/factory';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { NextRequest, NextResponse } from 'next/server';
vi.mock('@/lib/api/common', async () => ({ ...(await import('@/lib/api/common')), withErrorHandling: async (h:any, r:any) => { try { return await h(r); } catch (e:any) { return NextResponse.json({ error: e.message }, { status: 500 }); } } }));
vi.mock('@/services/auth/factory', () => ({ getApiAuthService: vi.fn() }));
vi.mock("@/lib/api/common", async () => ({ ...(await import("@/lib/api/common")), withErrorHandling: (h:any, r:any) => h(r) }));
vi.mock('@/middleware/with-auth-rate-limit', () => ({
  withAuthRateLimit: vi.fn((_req, handler) => handler(_req))
}));
vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));


describe('POST /api/auth/logout', () => {
  const mockAuthService = { getCurrentUser: vi.fn(), logout: vi.fn() };
  const createRequest = (url = 'http://localhost/api/auth/logout') =>
    new NextRequest(url, { method: 'POST' });

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuthService as unknown as vi.Mock).mockReturnValue(mockAuthService);
    mockAuthService.getCurrentUser.mockResolvedValue({ id: '1' });
    mockAuthService.logout.mockResolvedValue(undefined);
  });

  it('returns success with cookie header', async () => {
    const res = await POST(createRequest() as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('auth_token=');
    expect(data.data.message).toBe('Successfully logged out');
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('handles callbackUrl redirect', async () => {
    const res = await POST(createRequest('http://localhost/api/auth/logout?callbackUrl=http://localhost/bye') as any);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/bye');
  });

  it('returns 429 when rate limited', async () => {
    (withAuthRateLimit as unknown as vi.Mock).mockImplementationOnce(async () =>
      NextResponse.json({ error: 'rate' }, { status: 429 })
    );
    const res = await POST(createRequest() as any);
    expect(res.status).toBe(429);
  });

  it('handles service errors', async () => {
    mockAuthService.logout.mockRejectedValue(new Error('fail'));
    await expect(POST(createRequest() as any)).rejects.toThrow('fail');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { getApiAuthService } from '@/services/auth/factory';
import { createRateLimit } from '@/middleware/rate-limit';
import { ERROR_CODES } from '@/lib/api/common';
import { NextResponse } from 'next/server';

vi.mock('@/services/auth/factory', () => ({ getApiAuthService: vi.fn() }));
vi.mock('@/middleware/rate-limit', () => ({
  createRateLimit: vi.fn(() => vi.fn((_req: any, h: any) => h(_req)))
}));
vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));

describe('POST /api/auth/login', () => {
  const mockAuthService = { login: vi.fn() };
  const createRequest = (body?: any) =>
    new Request('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuthService as unknown as vi.Mock).mockReturnValue(mockAuthService);
    mockAuthService.login.mockResolvedValue({
      success: true,
      user: { id: '1', email: 'a@test.com' },
      token: 'token',
      expiresAt: 123,
      requiresMfa: false
    });
  });

  it('returns success on valid login', async () => {
    const res = await POST(createRequest({ email: 'a@test.com', password: 'p', rememberMe: true }) as any);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.token).toBe('token');
    expect(mockAuthService.login).toHaveBeenCalledWith({ email: 'a@test.com', password: 'p', rememberMe: true });
  });

  it('returns 401 for invalid credentials', async () => {
    mockAuthService.login.mockResolvedValue({ success: false, error: 'Invalid login credentials' });
    const res = await POST(createRequest({ email: 'a@test.com', password: 'wrong' }) as any);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error.code).toBe(ERROR_CODES.INVALID_CREDENTIALS);
  });

  it('returns 403 when email not verified', async () => {
    mockAuthService.login.mockResolvedValue({ success: false, error: 'Email not confirmed' });
    const res = await POST(createRequest({ email: 'a@test.com', password: 'p' }) as any);
    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.error.code).toBe(ERROR_CODES.EMAIL_NOT_VERIFIED);
  });

  it('returns 429 when rate limited', async () => {
    (createRateLimit as unknown as vi.Mock).mockImplementationOnce(() =>
      async () => NextResponse.json({ error: { code: ERROR_CODES.INVALID_REQUEST } }, { status: 429 })
    );
    const res = await POST(createRequest({ email: 'a@test.com', password: 'p' }) as any);
    expect(res.status).toBe(429);
  });

  it('returns 500 on service error', async () => {
    mockAuthService.login.mockRejectedValue(new Error('boom'));
    const res = await POST(createRequest({ email: 'a@test.com', password: 'p' }) as any);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
  });
});

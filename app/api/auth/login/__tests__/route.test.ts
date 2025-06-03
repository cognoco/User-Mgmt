import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '../route';
import { getApiAuthService } from '@/services/auth/factory';
import { ERROR_CODES } from '@/lib/api/common';

vi.mock('@/services/auth/factory', () => ({ getApiAuthService: vi.fn() }));
vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));

describe('POST /api/auth/login', () => {
  const mockAuthService = { login: vi.fn() };
  const createRequest = (body?: any) =>
    new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuthService as any).mockReturnValue(mockAuthService);
    mockAuthService.login.mockResolvedValue({
      success: true,
      user: { id: '1', email: 'a@test.com' },
      token: 'token',
      expiresAt: 123,
      requiresMfa: false
    });
  });

  it('returns success on valid login', async () => {
    const res = await POST(createRequest({ email: 'a@test.com', password: 'p', rememberMe: true }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.token).toBe('token');
    expect(mockAuthService.login).toHaveBeenCalledWith({ email: 'a@test.com', password: 'p', rememberMe: true });
  });

  it('returns 401 for invalid credentials', async () => {
    mockAuthService.login.mockResolvedValue({ success: false, error: 'Invalid login credentials' });
    const res = await POST(createRequest({ email: 'a@test.com', password: 'wrong' }));
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error.code).toBe(ERROR_CODES.INVALID_CREDENTIALS);
  });

  it('returns 403 when email not verified', async () => {
    mockAuthService.login.mockResolvedValue({ success: false, error: 'Email not confirmed' });
    const res = await POST(createRequest({ email: 'a@test.com', password: 'p' }));
    const data = await res.json();
    expect(res.status).toBe(403);
    expect(data.error.code).toBe(ERROR_CODES.EMAIL_NOT_VERIFIED);
  });

  it('returns 500 on service error', async () => {
    mockAuthService.login.mockRejectedValue(new Error('boom'));
    const res = await POST(createRequest({ email: 'a@test.com', password: 'p' }));
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
  });
});

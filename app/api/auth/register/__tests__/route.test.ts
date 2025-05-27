import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { getApiAuthService } from '@/services/auth/factory';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { associateUserWithCompanyByDomain } from '@/lib/auth/domainMatcher';
import { logUserAction } from '@/lib/audit/auditLogger';
import { ERROR_CODES } from '@/lib/api/common';
import { NextResponse } from 'next/server';

vi.mock('@/services/auth/factory', () => ({ getApiAuthService: vi.fn() }));
vi.mock('@/middleware/with-auth-rate-limit', () => ({
  withAuthRateLimit: vi.fn((_req, handler) => handler(_req))
}));
vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));
vi.mock('@/lib/auth/domainMatcher', () => ({ associateUserWithCompanyByDomain: vi.fn(() => ({ matched: false })) }));
vi.mock('@/lib/audit/auditLogger', () => ({ logUserAction: vi.fn() }));

describe('POST /api/auth/register', () => {
  const mockAuthService = { register: vi.fn() };
  const createRequest = (body?: any) =>
    new Request('http://localhost/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuthService as unknown as vi.Mock).mockReturnValue(mockAuthService);
    mockAuthService.register.mockResolvedValue({ success: true, user: { id: '1', email: 'a@test.com' } });
  });

  it('validates request body', async () => {
    const res = await POST(createRequest({}) as any);
    expect(res.status).toBe(400);
  });

  it('returns success on valid registration', async () => {
    const res = await POST(createRequest({
      userType: 'private',
      email: 'a@test.com',
      password: 'Password123!',
      firstName: 'A',
      lastName: 'B',
      acceptTerms: true
    }) as any);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.data.user.email).toBe('a@test.com');
    expect(mockAuthService.register).toHaveBeenCalled();
  });

  it('returns 409 when user exists', async () => {
    mockAuthService.register.mockResolvedValue({ success: false, error: 'already exists' });
    const res = await POST(createRequest({
      userType: 'private',
      email: 'a@test.com',
      password: 'Password123!',
      firstName: 'A',
      lastName: 'B',
      acceptTerms: true
    }) as any);
    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data.error.code).toBe(ERROR_CODES.ALREADY_EXISTS);
  });

  it('handles service errors', async () => {
    mockAuthService.register.mockRejectedValue(new Error('fail'));
    const res = await POST(createRequest({
      userType: 'private',
      email: 'a@test.com',
      password: 'Password123!',
      firstName: 'A',
      lastName: 'B',
      acceptTerms: true
    }) as any);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
  });

  it('returns 429 when rate limited', async () => {
    (withAuthRateLimit as unknown as vi.Mock).mockImplementationOnce(async () =>
      NextResponse.json({ error: 'rate' }, { status: 429 })
    );
    const res = await POST(createRequest({
      userType: 'private',
      email: 'a@test.com',
      password: 'Password123!',
      firstName: 'A',
      lastName: 'B',
      acceptTerms: true
    }) as any);
    expect(res.status).toBe(429);
  });
});

import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { POST } from '../route';
import { getApiAuthService } from '@/services/auth/factory';
import { createRateLimit } from '@/middleware/rate-limit';
import { NextRequest, NextResponse } from 'next/server';
import { ERROR_CODES } from '@/lib/api/common';

vi.mock('@/services/auth/factory', () => ({
  getApiAuthService: vi.fn()
}));
vi.mock('@/middleware/rate-limit', () => ({
  createRateLimit: vi.fn(() => vi.fn((_req: any, h: any) => h(_req)))
}));
vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));

describe('POST /api/auth/send-verification-email', () => {
  const mockAuthService = {
    sendVerificationEmail: vi.fn()
  };

  const createRequest = (email: string) =>
    new NextRequest('http://localhost/api/auth/send-verification-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuthService as unknown as Mock).mockReturnValue(mockAuthService);
    mockAuthService.sendVerificationEmail.mockResolvedValue({ success: true });
  });

  it('returns 429 when rate limited', async () => {
    const mockCreateRateLimit = createRateLimit as unknown as Mock;
    mockCreateRateLimit.mockImplementationOnce(() =>
      async () => NextResponse.json({ error: { code: 'rate_limit_exceeded' } }, { status: 429 })
    );
    const res = await POST(createRequest('test@example.com'));
    expect(res.status).toBe(429);
  });

  it('validates request body', async () => {
    const request = new NextRequest('http://localhost/api/auth/send-verification-email', { method: 'POST' });
    const res = await POST(request);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error.code).toBe(ERROR_CODES.INVALID_REQUEST);
  });

  it('returns success when service succeeds', async () => {
    const res = await POST(createRequest('test@example.com'));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.message).toBe('If an account exists with this email, a verification email has been sent.');
    expect(mockAuthService.sendVerificationEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('still returns success when service fails', async () => {
    mockAuthService.sendVerificationEmail.mockResolvedValueOnce({ success: false, error: 'fail' });
    const res = await POST(createRequest('test@example.com'));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.data.message).toBe('If an account exists with this email, a verification email has been sent.');
  });

  it('handles unexpected errors', async () => {
    mockAuthService.sendVerificationEmail.mockRejectedValueOnce(new Error('oops'));
    const res = await POST(createRequest('test@example.com'));
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
  });
});

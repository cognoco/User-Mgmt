import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { getApiAuthService } from '@/lib/api/auth/factory';
import { checkRateLimit } from '@/middleware/rate-limit';
import { NextRequest } from 'next/server';
import { ERROR_CODES } from '@/lib/api/common';

vi.mock('@/lib/api/auth/factory', () => ({
  getApiAuthService: vi.fn()
}));
vi.mock('@/middleware/rate-limit', () => ({
  checkRateLimit: vi.fn()
}));

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
    (getApiAuthService as unknown as vi.Mock).mockReturnValue(mockAuthService);
    (checkRateLimit as unknown as vi.Mock).mockResolvedValue(false);
    mockAuthService.sendVerificationEmail.mockResolvedValue({ success: true });
  });

  it('returns 429 when rate limited', async () => {
    (checkRateLimit as unknown as vi.Mock).mockResolvedValue(true);
    const res = await POST(createRequest('test@example.com'));
    const data = await res.json();
    expect(res.status).toBe(429);
    expect(data.error.code).toBe(ERROR_CODES.INVALID_REQUEST);
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

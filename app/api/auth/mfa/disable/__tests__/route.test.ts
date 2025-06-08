import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@app/api/auth/mfa/disable/route';
import { getApiAuthService } from '@/services/auth/factory';
import { createRateLimit } from '@/middleware/rateLimit';

vi.mock('@/services/auth/factory', () => ({ getApiAuthService: vi.fn() }));
vi.mock('@/middleware/rate-limit', () => ({
  createRateLimit: vi.fn(() => vi.fn((_req: any, h: any) => h(_req)))
}));
vi.mock('@/middleware/with-security', () => ({
  withSecurity: (handler: any) => handler
}));

describe('POST /api/auth/mfa/disable', () => {
  const mockAuthService = { disableMFA: vi.fn() };
  const createRequest = (code?: string) => new NextRequest('http://localhost/api/auth/mfa/disable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: code ? JSON.stringify({ code }) : undefined
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (getApiAuthService as unknown as Mock).mockReturnValue(mockAuthService);
    mockAuthService.disableMFA.mockResolvedValue({ success: true });
  });

  it('returns 400 when code missing', async () => {
    const res = await POST(createRequest());
    expect(res.status).toBe(400);
  });

  it('returns success when MFA disabled', async () => {
    const res = await POST(createRequest('1234'));
    expect(res.status).toBe(200);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE } from '@app/api/auth/delete-account/route';
import { setupAuthServiceMock } from '@/tests/factories/authServiceFactory';

vi.mock('@/services/auth/factory');
vi.mock('@/middleware/with-auth-rate-limit', () => ({
  withAuthRateLimit: vi.fn((_req, handler) => handler(_req))
}));
vi.mock('@/middleware/with-security', () => ({
  withSecurity: (handler: any) => handler
}));

describe('DELETE /api/auth/delete-account', () => {
  let mockAuthService: ReturnType<typeof setupAuthServiceMock>;
  
  const createRequest = (password?: string) => new NextRequest('http://localhost/api/auth/delete-account', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: password ? JSON.stringify({ password }) : undefined
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthService = setupAuthServiceMock();
    // Factory provides deleteAccount with default success response
  });

  it('returns 400 when password missing', async () => {
    const res = await DELETE(createRequest());
    expect(res.status).toBe(400);
  });

  it('calls service and returns success', async () => {
    const res = await DELETE(createRequest('pass'));
    expect(res.status).toBe(200);
    expect(mockAuthService.deleteAccount).toHaveBeenCalledWith('pass');
  });
});

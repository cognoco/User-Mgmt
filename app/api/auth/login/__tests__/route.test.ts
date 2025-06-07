import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/auth/login/route';
import { ERROR_CODES } from '@/lib/api/common';

// Mock the service container to avoid circular dependencies
vi.mock('@/lib/config/service-container', () => ({
  getServiceContainer: vi.fn()
}));

vi.mock('@/middleware/with-security', () => ({ withSecurity: (h: any) => h }));

describe('POST /api/auth/login', () => {
  const mockAuthService = { 
    login: vi.fn(),
    getCurrentUser: vi.fn().mockResolvedValue(null) // Return null for public endpoints
  };
  
  const mockServices = {
    auth: mockAuthService,
    user: { getUserById: vi.fn() },
    permission: { checkPermission: vi.fn() },
    session: { createSession: vi.fn() },
    team: { createTeam: vi.fn() },
    subscription: { getSubscription: vi.fn() },
    apiKey: { createApiKey: vi.fn() }
  };
  
  const createRequest = (body?: any) =>
    new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Set required environment variables for Supabase
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    
    // Mock the service container to return our mock services
    const { getServiceContainer } = await import('@/lib/config/serviceContainer');
    (getServiceContainer as any).mockReturnValue(mockServices);
    
    // Set up default successful login response
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
    expect(mockAuthService.login).toHaveBeenCalledWith(
      { email: 'a@test.com', password: 'p', rememberMe: true },
      expect.objectContaining({
        ipAddress: expect.any(String),
        userAgent: expect.any(String)
      })
    );
  });

  it('returns 401 for invalid credentials', async () => {
    mockAuthService.login.mockResolvedValue({ 
      success: false, 
      error: 'Invalid login credentials',
      code: 'INVALID_CREDENTIALS'
    });
    const res = await POST(createRequest({ email: 'a@test.com', password: 'wrong' }));
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error.code).toBe(ERROR_CODES.INVALID_CREDENTIALS);
  });

  it('returns 403 when email not verified', async () => {
    mockAuthService.login.mockResolvedValue({ 
      success: false, 
      error: 'Email not confirmed',
      code: 'EMAIL_NOT_VERIFIED'
    });
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

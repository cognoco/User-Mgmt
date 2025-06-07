import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/verify-email/route';

// Mock the service container to avoid circular dependencies
vi.mock('@/lib/config/service-container', () => ({
  getServiceContainer: vi.fn()
}));

vi.mock('@/middleware/with-auth-rate-limit', () => ({
  withAuthRateLimit: vi.fn((_req, handler) => handler(_req))
}));
vi.mock('@/middleware/with-security', () => ({
  withSecurity: (handler: any) => handler
}));

describe('POST /api/auth/verify-email', () => {
  const mockAuthService = { 
    verifyEmail: vi.fn(),
    getCurrentUser: vi.fn().mockResolvedValue(null) // Public route
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
  
  const createRequest = (token?: string) => new NextRequest('http://localhost/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: token ? JSON.stringify({ token }) : JSON.stringify({})
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
    
    mockAuthService.verifyEmail.mockResolvedValue(undefined);
  });

  it('returns 400 when body is missing', async () => {
    const res = await POST(createRequest() as any);
    expect(res.status).toBe(400);
  });

  it('returns success when verification succeeds', async () => {
    const res = await POST(createRequest('abc') as any);
    expect(res.status).toBe(200);
    expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('abc');
  });
});

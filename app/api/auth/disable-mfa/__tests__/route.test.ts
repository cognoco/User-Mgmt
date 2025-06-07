import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/disable-mfa/route';

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

describe('POST /api/auth/disable-mfa', () => {
  const mockAuthService = { 
    disableMFA: vi.fn(),
    getCurrentUser: vi.fn().mockResolvedValue({ id: 'user123', email: 'test@example.com' })
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
  
  const createRequest = (code?: string) => new NextRequest('http://localhost/api/auth/disable-mfa', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token' // Add auth header for authenticated requests
    },
    body: code ? JSON.stringify({ code }) : JSON.stringify({}) // Always provide valid JSON
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
    
    mockAuthService.disableMFA.mockResolvedValue({ success: true });
  });

  it('returns 400 when code missing', async () => {
    const res = await POST(createRequest());
    expect(res.status).toBe(400);
  });

  it('returns success when MFA disabled', async () => {
    const res = await POST(createRequest('1234'));
    expect(res.status).toBe(200);
    expect(mockAuthService.disableMFA).toHaveBeenCalledWith('1234');
  });
});

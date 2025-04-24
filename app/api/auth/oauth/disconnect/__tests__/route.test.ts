import { POST } from '../route';
import { OAuthProvider } from '@/types/oauth';
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
// import { cookies } from 'next/headers'; // Mocked
// import { createServerClient } from '@supabase/ssr'; // Mocked
// import { prisma } from '@/lib/database/prisma'; // Mocked
import { logUserAction } from '@/lib/audit/auditLogger'; // Mocked

// --- Mocks ---

// 1. Mock next/headers cookies
const mockCookies = new Map<string, any>();
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (key: string) => mockCookies.get(key),
    set: (key: string | { name: string; [key: string]: any }, value?: string | object) => {
      if (typeof key === 'string') {
        mockCookies.set(key, { name: key, value: value, httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/', ...((typeof value === 'object') ? value : {}) });
      } else {
        mockCookies.set(key.name, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/', ...key });
      }
    },
    has: (key: string) => mockCookies.has(key),
    delete: (key: string) => mockCookies.delete(key),
    getAll: () => Array.from(mockCookies.values()),
  }),
}));

// 2. Mock Supabase Client
const mockSupabaseAuth = {
  getUser: vi.fn(),
};
const mockSupabaseClient = {
  auth: mockSupabaseAuth,
};
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mockSupabaseClient),
}));

// 3. Mock Prisma Client
const mockPrismaAccount = {
  findMany: vi.fn(),
  deleteMany: vi.fn(),
};
vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    account: mockPrismaAccount,
  },
}));

// 4. Mock Audit Logger
vi.mock('@/lib/audit/auditLogger', () => ({
  logUserAction: vi.fn(),
}));

const mockLogUserAction = logUserAction as MockedFunction<typeof logUserAction>;

// --- Test Data ---
const loggedInUserId = 'logged-in-user-abc';
const providerToDisconnect = OAuthProvider.GITHUB;

const mockLoggedInUser = {
  id: loggedInUserId,
  email: 'original@example.com',
  user_metadata: {
    // Start with password assumed false for testing last login method
    hasPassword: false,
  },
};

const mockUserAccounts = [
  { user_id: loggedInUserId, provider: 'google' },
  { user_id: loggedInUserId, provider: providerToDisconnect.toLowerCase() },
];

// --- Test Suite ---

describe('POST /api/auth/oauth/disconnect', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCookies.clear();
    // Assume user is logged in for most tests
    mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: mockLoggedInUser }, error: null });
  });

  // Helper to create request
  const createRequest = (body: object) => {
    return new Request('http://localhost/api/auth/oauth/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  it('should return 401 if user is not authenticated', async () => {
    mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized', status: 401 } });

    const request = createRequest({ provider: providerToDisconnect });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Authentication required');
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE' }));
  });

  it('should return 400 if provider is missing from request', async () => {
    const request = createRequest({}); // No provider
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('provider'); // Zod error
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE' }));
  });

  it('should return 400 if trying to unlink the last provider and no password exists', async () => {
    // Mock user having only one account (the one being disconnected)
    mockPrismaAccount.findMany.mockResolvedValue([
      { user_id: loggedInUserId, provider: providerToDisconnect.toLowerCase() },
    ]);
    // Ensure user has no password in mock
    mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: { ...mockLoggedInUser, user_metadata: { hasPassword: false } } }, error: null });

    const request = createRequest({ provider: providerToDisconnect });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('must have at least one login method');
    expect(mockPrismaAccount.deleteMany).not.toHaveBeenCalled();
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE' }));
  });

  it('should return 400 if the specified provider is not linked', async () => {
    mockPrismaAccount.findMany.mockResolvedValue(mockUserAccounts); // User has accounts
    mockPrismaAccount.deleteMany.mockResolvedValue({ count: 0 }); // But delete affects none

    const request = createRequest({ provider: providerToDisconnect });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('No linked account found');
    expect(mockPrismaAccount.deleteMany).toHaveBeenCalledWith({
      where: { user_id: loggedInUserId, provider: providerToDisconnect.toLowerCase() },
    });
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({
        userId: loggedInUserId,
        action: 'SSO_UNLINK',
        status: 'FAILURE',
        details: expect.objectContaining({ error: 'No linked account found' })
    }));
  });

  it('should successfully disconnect a provider when other methods exist (another provider)', async () => {
    mockPrismaAccount.findMany.mockResolvedValue(mockUserAccounts); // Has Google and GitHub
    mockPrismaAccount.deleteMany.mockResolvedValue({ count: 1 }); // Delete successful

    const request = createRequest({ provider: providerToDisconnect }); // Disconnect GitHub
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPrismaAccount.deleteMany).toHaveBeenCalledWith({
      where: { user_id: loggedInUserId, provider: providerToDisconnect.toLowerCase() },
    });
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({
        userId: loggedInUserId,
        action: 'SSO_UNLINK',
        status: 'SUCCESS',
        details: { provider: providerToDisconnect },
    }));
  });

  it('should successfully disconnect the last provider if a password exists', async () => {
     // Mock user having only one account but also a password
     mockPrismaAccount.findMany.mockResolvedValue([
        { user_id: loggedInUserId, provider: providerToDisconnect.toLowerCase() },
      ]);
     mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: { ...mockLoggedInUser, user_metadata: { hasPassword: true } } }, error: null });
     mockPrismaAccount.deleteMany.mockResolvedValue({ count: 1 }); // Delete successful

    const request = createRequest({ provider: providerToDisconnect });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPrismaAccount.deleteMany).toHaveBeenCalledWith({
      where: { user_id: loggedInUserId, provider: providerToDisconnect.toLowerCase() },
    });
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'SSO_UNLINK', status: 'SUCCESS' }));
  });

  it('should handle errors during prisma deleteMany', async () => {
    mockPrismaAccount.findMany.mockResolvedValue(mockUserAccounts); // Assume other accounts exist
    mockPrismaAccount.deleteMany.mockRejectedValue(new Error('DB delete failed'));

    const request = createRequest({ provider: providerToDisconnect });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500); // Or 400 depending on desired error handling
    expect(body.error).toBe('DB delete failed');
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({
        action: 'SSO_UNLINK',
        status: 'FAILURE',
        details: { error: 'DB delete failed' },
    }));
  });

}); 
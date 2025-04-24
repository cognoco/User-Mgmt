import { POST } from '../route';
import { OAuthProvider } from '@/types/oauth';
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
// import { cookies } from 'next/headers'; // Mocked
// import { createServerClient } from '@supabase/ssr'; // Mocked
// import { prisma } from '@/lib/database/prisma'; // Mocked
import { logUserAction } from '@/lib/audit/auditLogger'; // Mocked, but type used

// --- Mocks ---

// 1. Mock next/headers cookies (same as callback)
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

// 2. Mock Supabase Client (same as callback)
const mockSupabaseAuth = {
  exchangeCodeForSession: vi.fn(),
  getSession: vi.fn(), // Although not directly called, getUser might use it
  getUser: vi.fn(),
};
const mockSupabaseClient = {
  auth: mockSupabaseAuth,
};
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mockSupabaseClient),
}));

// 3. Mock Prisma Client (same as callback, adding findMany)
const mockPrismaAccount = {
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  findMany: vi.fn(), // Needed for the final success response
};
vi.mock('@/lib/database/prisma', () => ({
  prisma: {
    account: mockPrismaAccount,
  },
}));

// 4. Mock Audit Logger (same as callback)
vi.mock('@/lib/audit/auditLogger', () => ({
  logUserAction: vi.fn(),
}));

const mockLogUserAction = logUserAction as MockedFunction<typeof logUserAction>;

// --- Test Data ---
const validCode = 'valid-linking-code';
const loggedInUserId = 'logged-in-user-abc';
const providerToLink = OAuthProvider.GITHUB;
const providerToLinkAccountId = 'github-user-789';
const providerToLinkEmail = 'link@example.com';

const mockLoggedInUser = {
  id: loggedInUserId,
  email: 'original@example.com',
  // ... other fields
};

const mockProviderUser = {
  id: 'provider-internal-id-xyz', // This ID might not be the loggedInUserId initially
  email: providerToLinkEmail,
  app_metadata: {
    provider: 'github',
    provider_id: providerToLinkAccountId,
    providers: ['github']
  },
  // ... other fields
};

// --- Test Suite ---

describe('POST /api/auth/oauth/link', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCookies.clear();
    // Assume user is logged in for most tests
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockLoggedInUser }, error: null });
  });

  // Helper to create request
  const createRequest = (body: object) => {
    return new Request('http://localhost/api/auth/oauth/link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  it('should return 401 if user is not authenticated', async () => {
    mockSupabaseAuth.getUser.mockReset(); // Override beforeEach mock
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Unauthorized', status: 401 } });

    const request = createRequest({ provider: providerToLink, code: validCode });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Authentication required');
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE' }));
  });

  it('should return 400 if code exchange fails', async () => {
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({ data: null, error: { message: 'Invalid code for link', status: 400 } });

    const request = createRequest({ provider: providerToLink, code: 'invalid-code' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid code for link');
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE' }));
  });

  it('should return 400 if fetching provider user data fails', async () => {
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null }); // Success
    // First getUser (auth check) succeeds due to beforeEach
    // Second getUser (provider data) fails
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockLoggedInUser }, error: null }) // Auth check
                         .mockResolvedValueOnce({ data: null, error: { message: 'Provider fetch failed', status: 500 } }); // Provider data fetch

    const request = createRequest({ provider: providerToLink, code: validCode });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Provider fetch failed');
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE' }));
  });

  it('should return 409 if provider account is already linked', async () => {
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null });
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockLoggedInUser }, error: null }) // Auth check
                         .mockResolvedValueOnce({ data: { user: mockProviderUser }, error: null }); // Provider data fetch
    mockPrismaAccount.findUnique.mockResolvedValue({ id: 'existing-link-id' }); // Simulate existing link

    const request = createRequest({ provider: providerToLink, code: validCode });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain('already linked');
    expect(mockPrismaAccount.findUnique).toHaveBeenCalledWith({
      where: { provider_provider_account_id: { provider: providerToLink.toLowerCase(), provider_account_id: providerToLinkAccountId } }
    });
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE' }));
  });

  it('should return 409 on email collision with another account', async () => {
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null });
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockLoggedInUser }, error: null })
                         .mockResolvedValueOnce({ data: { user: mockProviderUser }, error: null });
    mockPrismaAccount.findUnique.mockResolvedValue(null); // Not linked by provider ID
    mockPrismaAccount.findFirst.mockResolvedValue({ id: 'collision-account-id' }); // Found by email

    const request = createRequest({ provider: providerToLink, code: validCode });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain('account with this email already exists');
    expect(body.collision).toBe(true);
    expect(mockPrismaAccount.findFirst).toHaveBeenCalledWith({ where: { provider_email: providerToLinkEmail } });
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE' }));
  });

  it('should successfully link a new provider account', async () => {
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null });
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockLoggedInUser }, error: null })
                         .mockResolvedValueOnce({ data: { user: mockProviderUser }, error: null });
    mockPrismaAccount.findUnique.mockResolvedValue(null); // Not linked
    mockPrismaAccount.findFirst.mockResolvedValue(null); // No collision
    mockPrismaAccount.create.mockResolvedValue({ id: 'new-link-id' }); // Success create
    // Mock findMany for the final response
    mockPrismaAccount.findMany.mockResolvedValue([
        { provider: 'google' }, // Assume google was already linked
        { provider: providerToLink.toLowerCase() } // The newly linked one
    ]);

    const request = createRequest({ provider: providerToLink, code: validCode });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.user).toEqual(mockLoggedInUser);
    expect(body.linkedProviders).toEqual(['google', providerToLink.toLowerCase()]);

    expect(mockPrismaAccount.create).toHaveBeenCalledWith({ data: {
      user_id: loggedInUserId,
      provider: providerToLink.toLowerCase(),
      provider_account_id: providerToLinkAccountId,
      provider_email: providerToLinkEmail,
    }});
    expect(mockPrismaAccount.findMany).toHaveBeenCalledWith({ where: { user_id: loggedInUserId }, select: { provider: true } });
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({ userId: loggedInUserId, action: 'SSO_LINK', status: 'SUCCESS' }));
  });

  it('should handle errors during prisma account create', async () => {
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null });
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockLoggedInUser }, error: null })
                         .mockResolvedValueOnce({ data: { user: mockProviderUser }, error: null });
    mockPrismaAccount.findUnique.mockResolvedValue(null); // Not linked
    mockPrismaAccount.findFirst.mockResolvedValue(null); // No collision
    const createError = new Error('DB link create failed');
    mockPrismaAccount.create.mockRejectedValue(createError); // Simulate create failure

    const request = createRequest({ provider: providerToLink, code: validCode });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400); // Should match the error handling block
    expect(body.error).toBe(createError.message);
    expect(mockPrismaAccount.create).toHaveBeenCalledTimes(1);
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({
      action: 'SSO_LINK',
      status: 'FAILURE',
      details: { error: createError.message },
    }));
  });

  it('should return 400 if provider returns no identifier (email or providerId)', async () => {
    const providerUserWithoutIds = {
      ...mockProviderUser,
      email: undefined,
      app_metadata: { ...mockProviderUser.app_metadata, provider_id: undefined },
    };
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null });
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockLoggedInUser }, error: null }) // Auth check
                         .mockResolvedValueOnce({ data: { user: providerUserWithoutIds }, error: null }); // Provider data fetch

    const request = createRequest({ provider: providerToLink, code: validCode });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('Provider did not return a unique identifier');
    expect(mockPrismaAccount.findUnique).not.toHaveBeenCalled();
    expect(mockPrismaAccount.create).not.toHaveBeenCalled();
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({ status: 'FAILURE' }));
  });

  // TODO: Add tests for:
  // - Scenario where provider does not return email or providerAccountId

}); 
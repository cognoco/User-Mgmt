import { POST } from '../route';
import { OAuthProvider } from '@/types/oauth';
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
// import { cookies } from 'next/headers'; // Mocked
// import { createServerClient } from '@supabase/ssr'; // Mocked
import { logUserAction } from '@/lib/audit/auditLogger'; // Mocked, but type used
import { sendProviderLinkedNotification } from '@/lib/notifications/sendProviderLinkedNotification';

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
const mockFrom = vi.fn();
const mockSupabaseClient = {
  auth: mockSupabaseAuth,
  from: mockFrom,
};
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => mockSupabaseClient),
}));

interface Builder {
  select: any; eq: any; maybeSingle: any; insert: any; then: any;
}
let builders: Array<{ table: string; builder: Builder }> = [];
function createBuilder(response: any = { data: null, error: null }): Builder {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(response)),
    insert: vi.fn(() => Promise.resolve(response)),
  };
  builder.then = (resolve: any, reject?: any) => Promise.resolve(response).then(resolve, reject);
  return builder;
}

// 3. Mock Audit Logger (same as callback)
vi.mock('@/lib/audit/auditLogger', () => ({
  logUserAction: vi.fn(),
}));
vi.mock('@/lib/notifications/sendProviderLinkedNotification', () => ({
  sendProviderLinkedNotification: vi.fn(),
}));

const mockLogUserAction = logUserAction as MockedFunction<typeof logUserAction>;
const mockSendNotification = sendProviderLinkedNotification as MockedFunction<typeof sendProviderLinkedNotification>;

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
    builders = [];
    mockFrom.mockImplementation((table: string) => {
      const b = createBuilder();
      builders.push({ table, builder: b });
      return b;
    });
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
  });

  it('should return 400 if code exchange fails', async () => {
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({ data: null, error: { message: 'Invalid code for link', status: 400 } });

    const request = createRequest({ provider: providerToLink, code: 'invalid-code' });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid code for link');
  });

  it('should return 400 if fetching provider user data fails', async () => {
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null }); // Success
    mockSupabaseAuth.getUser.mockReset();
    mockSupabaseAuth.getUser
      .mockResolvedValueOnce({ data: { user: mockLoggedInUser }, error: null }) // Auth check
      .mockResolvedValueOnce({ data: null, error: { message: 'Provider fetch failed', status: 500 } }); // Provider data fetch

    const request = createRequest({ provider: providerToLink, code: validCode });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Provider fetch failed');
  });

  it('should return 409 if provider account is already linked', async () => {
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null });
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: mockLoggedInUser }, error: null }) // Auth check
                         .mockResolvedValueOnce({ data: { user: mockProviderUser }, error: null }); // Provider data fetch
    const builder = createBuilder({ data: { id: 'existing-link-id', user_id: 'other' }, error: null });
    mockFrom.mockReturnValueOnce(builder);

    const request = createRequest({ provider: providerToLink, code: validCode });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain('already linked');
    expect(mockFrom).toHaveBeenCalledWith('account');
    expect(builder.select).toHaveBeenCalledWith('id, user_id');
  });

  it('should return 409 on email collision with another account', async () => {
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null });
    mockSupabaseAuth.getUser.mockReset();
    mockSupabaseAuth.getUser
      .mockResolvedValueOnce({ data: { user: mockLoggedInUser }, error: null })
      .mockResolvedValueOnce({ data: { user: mockProviderUser }, error: null });
    const builder1 = createBuilder({ data: null, error: null });
    const builder2 = createBuilder({ data: { id: 'collision-account-id', user_id: 'other' }, error: null });
    mockFrom.mockReturnValueOnce(builder1).mockReturnValueOnce(builder2);

    const request = createRequest({ provider: providerToLink, code: validCode });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain('account with this email already exists');
    expect(body.collision).toBe(true);
    expect(mockFrom).toHaveBeenCalledTimes(2);
  });

  it('should successfully link a new provider account', async () => {
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null });
    mockSupabaseAuth.getUser.mockReset();
    mockSupabaseAuth.getUser
      .mockResolvedValueOnce({ data: { user: mockLoggedInUser }, error: null })
      .mockResolvedValueOnce({ data: { user: mockProviderUser }, error: null });
    const builder1 = createBuilder({ data: null, error: null });
    const builder2 = createBuilder({ data: null, error: null });
    const builder3 = createBuilder({ data: { id: 'new-link-id' }, error: null });
    const builder4 = createBuilder({ data: [ { provider: 'google' }, { provider: providerToLink.toLowerCase() } ], error: null });
    mockFrom
      .mockReturnValueOnce(builder1)
      .mockReturnValueOnce(builder2)
      .mockReturnValueOnce(builder3)
      .mockReturnValueOnce(builder4);

    const request = createRequest({ provider: providerToLink, code: validCode });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.user).toEqual(mockLoggedInUser);
    expect(body.linkedProviders).toEqual(['google', providerToLink.toLowerCase()]);

    expect(mockFrom).toHaveBeenCalledTimes(4);
    expect(mockLogUserAction).toHaveBeenCalledWith(expect.objectContaining({ userId: loggedInUserId, action: 'SSO_LINK', status: 'SUCCESS' }));
    expect(mockSendNotification).toHaveBeenCalledWith(loggedInUserId, providerToLink);
  });

  it('should handle errors during prisma account create', async () => {
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({ data: { session: {} }, error: null });
    mockSupabaseAuth.getUser.mockReset();
    mockSupabaseAuth.getUser
      .mockResolvedValueOnce({ data: { user: mockLoggedInUser }, error: null })
      .mockResolvedValueOnce({ data: { user: mockProviderUser }, error: null });
    const builder1 = createBuilder({ data: null, error: null });
    const builder2 = createBuilder({ data: null, error: null });
    const createError = new Error('DB link create failed');
    const builder3 = createBuilder({ data: null, error: null });
    builder3.insert = vi.fn(() => Promise.reject(createError));
    mockFrom
      .mockReturnValueOnce(builder1)
      .mockReturnValueOnce(builder2)
      .mockReturnValueOnce(builder3);

    const request = createRequest({ provider: providerToLink, code: validCode });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400); // Should match the error handling block
    expect(body.error).toBe(createError.message);
    expect(builder3.insert).toHaveBeenCalledTimes(1);
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
    mockSupabaseAuth.getUser.mockReset();
    mockSupabaseAuth.getUser
      .mockResolvedValueOnce({ data: { user: mockLoggedInUser }, error: null }) // Auth check
      .mockResolvedValueOnce({ data: { user: providerUserWithoutIds }, error: null }); // Provider data fetch

    const request = createRequest({ provider: providerToLink, code: validCode });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain('Provider did not return a unique identifier');
    expect(mockFrom).not.toHaveBeenCalled();
  });

  // TODO: Add tests for:
  // - Scenario where provider does not return email or providerAccountId

}); 
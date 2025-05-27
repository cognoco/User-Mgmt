import { POST } from '../route';
import { OAuthProvider } from '@/types/oauth';
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { logUserAction } from '@/lib/audit/auditLogger';
import { sendProviderLinkedNotification } from '@/lib/notifications/sendProviderLinkedNotification';

// Mock cookies
const mockCookies = new Map<string, any>();
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (key: string) => mockCookies.get(key),
    set: (key: string | { name: string; [key: string]: any }, value?: string | object) => {
      if (typeof key === 'string') {
        mockCookies.set(key, { name: key, value, httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/', ...((typeof value === 'object') ? value : {}) });
      } else {
        mockCookies.set(key.name, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/', ...key });
      }
    },
    has: (key: string) => mockCookies.has(key),
    delete: (key: string) => mockCookies.delete(key),
    getAll: () => Array.from(mockCookies.values()),
  }),
}));

// Mock Supabase client
const mockSupabaseAuth = {
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

vi.mock('@/lib/audit/auditLogger', () => ({
  logUserAction: vi.fn(),
}));
vi.mock('@/lib/notifications/sendProviderLinkedNotification', () => ({
  sendProviderLinkedNotification: vi.fn(),
}));
const mockLogUserAction = logUserAction as MockedFunction<typeof logUserAction>;
const mockSendNotification = sendProviderLinkedNotification as MockedFunction<typeof sendProviderLinkedNotification>;

const createRequest = (body: object) => new Request('http://localhost/api/auth/oauth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const loggedInUser = { id: 'user1', email: 'test@example.com' };

describe('oauth verify route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookies.clear();
    mockSupabaseAuth.getUser.mockResolvedValue({ data: { user: loggedInUser }, error: null });
    mockFrom.mockReset();
  });

  it('returns 401 when unauthenticated', async () => {
    mockSupabaseAuth.getUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'auth', status: 401 } });
    const request = createRequest({ providerId: OAuthProvider.GITHUB, email: 'new@example.com' });
    const res = await POST(request);
    expect(res.status).toBe(401);
  });

  it('returns 409 when email already used by another user', async () => {
    const builder = { select: vi.fn(() => builder), eq: vi.fn(() => builder), maybeSingle: vi.fn(() => Promise.resolve({ data: { user_id: 'other' }, error: null })) };
    mockFrom.mockReturnValueOnce(builder as any);
    const request = createRequest({ providerId: OAuthProvider.GITHUB, email: 'existing@example.com' });
    const res = await POST(request);
    expect(res.status).toBe(409);
  });

  it('returns success and sends notification', async () => {
    const builder = { select: vi.fn(() => builder), eq: vi.fn(() => builder), maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })) };
    mockFrom.mockReturnValueOnce(builder as any);
    const request = createRequest({ providerId: OAuthProvider.GITHUB, email: 'new@example.com' });
    const res = await POST(request);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockSendNotification).toHaveBeenCalledWith(loggedInUser.id, OAuthProvider.GITHUB);
    expect(mockLogUserAction).toHaveBeenCalled();
  });
});

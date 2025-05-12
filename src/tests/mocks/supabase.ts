// Mock Supabase client using Vitest
import { vi, Mock } from 'vitest';
import type { 
  SupabaseClient, 
  AuthResponse, 
  AuthError, 
  Session, 
  UserResponse, 
  SignInWithPasswordCredentials, 
  SignInWithOAuthCredentials, 
  SignUpWithPasswordCredentials, 
  AuthTokenResponsePassword, 
  AuthMFAListFactorsResponse, 
  MFAChallengeParams, 
  AuthMFAChallengeResponse, 
  MFAVerifyParams, 
  AuthMFAVerifyResponse, 
  MFAEnrollParams, 
  AuthMFAEnrollResponse, // Assuming this type exists or use specific ones
  AuthMFAUnenrollResponse, MFAUnenrollParams,
  // AuthMFAResponse // General MFA response type if needed - Removed as it doesn't exist
} from '@supabase/supabase-js'; // Import necessary types

// Define a type for the RPC response structure
type SupabaseRpcResponse = { data: unknown | null; error: unknown | null };

// Helper to create a fully chainable builder
function createMockBuilder(table?: string, orgId?: string) {
  const query: any = { table, orgId };
  // The builder is a function so it can be called and is a thenable
  function builder() {}
  // Attach all methods as own properties
  Object.defineProperties(builder, {
    _query: { value: query, writable: true, enumerable: false },
    select: { value: vi.fn(function (arg: any) { query.select = arg; return builder; }), writable: true },
    insert: { value: vi.fn(function (arg: any) { query.insert = arg; return builder; }), writable: true },
    update: { value: vi.fn(function (arg: any) { query.update = arg; return builder; }), writable: true },
    upsert: { value: vi.fn(function (arg: any) { query.upsert = arg; return builder; }), writable: true },
    delete: { value: vi.fn(function (arg: any) { query.delete = arg; return builder; }), writable: true },
    eq: { value: vi.fn(function (...args: any[]) { query.eq = args; return builder; }), writable: true },
    neq: { value: vi.fn(function (...args: any[]) { query.neq = args; return builder; }), writable: true },
    gt: { value: vi.fn(function (...args: any[]) { query.gt = args; return builder; }), writable: true },
    gte: { value: vi.fn(function (...args: any[]) { query.gte = args; return builder; }), writable: true },
    lt: { value: vi.fn(function (...args: any[]) { query.lt = args; return builder; }), writable: true },
    lte: { value: vi.fn(function (...args: any[]) { query.lte = args; return builder; }), writable: true },
    like: { value: vi.fn(function (...args: any[]) { query.like = args; return builder; }), writable: true },
    ilike: { value: vi.fn(function (...args: any[]) { query.ilike = args; return builder; }), writable: true },
    in: { value: vi.fn(function (...args: any[]) { query.in = args; return builder; }), writable: true },
    is: { value: vi.fn(function (...args: any[]) { query.is = args; return builder; }), writable: true },
    or: { value: vi.fn(function (...args: any[]) { query.or = args; return builder; }), writable: true },
    filter: { value: vi.fn(function (...args: any[]) { query.filter = args; return builder; }), writable: true },
    range: { value: vi.fn(function (...args: any[]) { query.range = args; return builder; }), writable: true },
    order: { value: vi.fn(function (...args: any[]) { query.order = args; return builder; }), writable: true },
    limit: { value: vi.fn(function (...args: any[]) { query.limit = args; return builder; }), writable: true },
    single: { value: vi.fn(function () {
      if (query.table === 'organizations') {
        return Promise.resolve({
          data: {
            id: 'org-123',
            name: 'Acme Inc',
            domain: 'acme.com',
            sso_enabled: true,
            sso_provider: 'azure',
            sso_domain_required: true
          },
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    }), writable: true },
    maybeSingle: { value: vi.fn(function () { return builder.single(); }), writable: true },
    then: { value: function (resolve: any, reject: any) {
      if (query.table === 'organization_members') {
        if (
          query.select &&
          query.eq &&
          query.eq[0] === 'organization_id' &&
          query.eq[1] === 'org-123'
        ) {
          return Promise.resolve({
            data: [
              {
                user_id: 'user-123',
                email: 'user@example.com',
                role: 'member',
                active_sessions: 2,
                last_active: '2023-06-15T14:30:00Z'
              },
              {
                user_id: 'user-456',
                email: 'manager@example.com',
                role: 'manager',
                active_sessions: 1,
                last_active: '2023-06-14T16:45:00Z'
              },
              {
                user_id: 'admin-123',
                email: 'admin@example.com',
                role: 'admin',
                active_sessions: 1,
                last_active: '2023-06-15T09:15:00Z'
              }
            ],
            error: null
          }).then(resolve, reject);
        } else {
          return Promise.resolve({ data: [], error: null }).then(resolve, reject);
        }
      }
      return Promise.resolve({ data: null, error: null }).then(resolve, reject);
    }, writable: true, enumerable: false }
  });
  return builder;
}

const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) as Mock,
    signInWithPassword: vi.fn() as Mock<[SignInWithPasswordCredentials], Promise<AuthTokenResponsePassword>>,
    signInWithOAuth: vi.fn() as Mock,
    signUp: vi.fn() as Mock<[SignUpWithPasswordCredentials], Promise<AuthResponse>>,
    signOut: vi.fn() as Mock<[], Promise<{ error: AuthError | null }>>,
    resetPasswordForEmail: vi.fn() as Mock<[string, { redirectTo?: string }], Promise<{ data: Record<string, never>; error: AuthError | null }>>,
    updateUser: vi.fn() as Mock<[any], Promise<UserResponse>>,
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
      error: null,
    }),
    getSession: vi.fn() as Mock,
    refreshSession: vi.fn() as Mock<[], Promise<AuthResponse>>,
    mfa: {
      listFactors: vi.fn() as Mock<[], Promise<AuthMFAListFactorsResponse>>,
      challenge: vi.fn() as Mock<[MFAChallengeParams], Promise<AuthMFAChallengeResponse>>,
      verify: vi.fn() as Mock<[MFAVerifyParams], Promise<AuthMFAVerifyResponse>>,
      enroll: vi.fn() as Mock<[MFAEnrollParams], Promise<AuthMFAEnrollResponse>>,
      unenroll: vi.fn() as Mock<[MFAUnenrollParams], Promise<AuthMFAUnenrollResponse>>,
      updateFactor: vi.fn(),
      verifyWithBackupCode: vi.fn(),
    },
  },
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn(),
      download: vi.fn(),
      getPublicUrl: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
      move: vi.fn(),
    }),
  },
  rpc: vi.fn() as Mock<[string, unknown?], Promise<SupabaseRpcResponse>>,
  channel: vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn()
  }),
  from: vi.fn().mockImplementation((table: string) => createMockBuilder(table)),
};

// Cast the whole mock object for better type checking if possible
// Or rely on casting within tests: (supabase.auth.mfa.enroll as Mock).mockResolvedValueOnce(...)
export const supabase = mockSupabase as unknown as SupabaseClient; // Use casting carefully
// Remove CommonJS export
// module.exports = mockSupabase; 
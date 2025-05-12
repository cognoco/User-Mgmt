// Mock Supabase client using Vitest
import { vi, Mock } from 'vitest';
import type { 
  SupabaseClient, 
  AuthResponse, 
  AuthError, 
  UserResponse, 
  SignInWithPasswordCredentials, 
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
  const builder: any = function() {};
  // Attach all methods as own properties (and prototype)
  const methods = {
    _query: query,
    select: vi.fn(function (arg: any) { query.select = arg; return builder; }),
    insert: vi.fn(function (arg: any) { query.insert = arg; return builder; }),
    update: vi.fn(function (arg: any) { query.update = arg; return builder; }),
    upsert: vi.fn(function (arg: any) { query.upsert = arg; return builder; }),
    delete: vi.fn(function (arg: any) { query.delete = arg; return builder; }),
    eq: vi.fn(function (...args: any[]) {
      if (!Array.isArray(query.eqCalls)) query.eqCalls = [];
      query.eqCalls.push(args);
      return builder;
    }),
    neq: vi.fn(function (...args: any[]) { query.neq = args; return builder; }),
    gt: vi.fn(function (...args: any[]) { query.gt = args; return builder; }),
    gte: vi.fn(function (...args: any[]) { query.gte = args; return builder; }),
    lt: vi.fn(function (...args: any[]) { query.lt = args; return builder; }),
    lte: vi.fn(function (...args: any[]) { query.lte = args; return builder; }),
    like: vi.fn(function (...args: any[]) { query.like = args; return builder; }),
    ilike: vi.fn(function (...args: any[]) { query.ilike = args; return builder; }),
    in: vi.fn(function (...args: any[]) { query.in = args; return builder; }),
    is: vi.fn(function (...args: any[]) { query.is = args; return builder; }),
    or: vi.fn(function (...args: any[]) { query.or = args; return builder; }),
    filter: vi.fn(function (...args: any[]) { query.filter = args; return builder; }),
    range: vi.fn(function (...args: any[]) { query.range = args; return builder; }),
    order: vi.fn(function (...args: any[]) { query.order = args; return builder; }),
    limit: vi.fn(function (...args: any[]) { query.limit = args; return builder; }),
    single: vi.fn(function () {
      if (query.table === 'organizations') {
        if (typeof globalThis !== 'undefined' && Object.prototype.hasOwnProperty.call(globalThis, '__TEST_ORG_ERROR__') && (globalThis as any).__TEST_ORG_ERROR__) {
          return Promise.resolve({ data: null, error: (globalThis as any).__TEST_ORG_ERROR__ });
        }
        if (typeof globalThis !== 'undefined' && Object.prototype.hasOwnProperty.call(globalThis, '__TEST_ORG__') && (globalThis as any).__TEST_ORG__) {
          return Promise.resolve({ data: (globalThis as any).__TEST_ORG__, error: null });
        }
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
    }),
    maybeSingle: vi.fn(function () { return builder.single(); }),
    then: function (resolve: any, reject: any) {
      if (query.table === 'organization_members') {
        if (
          query.select &&
          query.eqCalls &&
          query.eqCalls.some((eq: any[]) => eq[0] === 'organization_id' && eq[1] === 'org-123')
        ) {
          return Promise.resolve({
            data: [
              { user_id: 'user-123', email: 'user@example.com', role: 'member', active_sessions: 2, last_active: '2023-06-15T14:30:00Z' },
              { user_id: 'user-456', email: 'manager@example.com', role: 'manager', active_sessions: 1, last_active: '2023-06-14T16:45:00Z' },
              { user_id: 'admin-123', email: 'admin@example.com', role: 'admin', active_sessions: 1, last_active: '2023-06-15T09:15:00Z' }
            ],
            error: null
          }).then(resolve, reject);
        } else {
          return Promise.resolve({ data: [], error: null }).then(resolve, reject);
        }
      }
      return Promise.resolve({ data: null, error: null }).then(resolve, reject);
    }
  };
  Object.setPrototypeOf(builder, methods);
  Object.assign(builder, methods);
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
export { createMockBuilder };
// Remove CommonJS export
// module.exports = mockSupabase; 

/*
  --- GLOBAL ORG MOCK USAGE ---
  In your tests, you can control the organization returned by supabase.from('organizations').single() or .maybeSingle() by setting:
    globalThis.__TEST_ORG__ = { ...yourOrgObject };
    globalThis.__TEST_ORG_ERROR__ = { message: 'Simulated error' };
  This allows you to simulate different orgs or error states without per-test mock overrides.
  Clean up these globals in afterEach if needed.
*/ 
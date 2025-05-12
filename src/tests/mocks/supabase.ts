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
  // Return a plain object with all methods as own properties
  const builder: any = { _query: query };

  const methods = {
    select(arg: any) { query.select = arg; return builder; },
    insert(arg: any) { query.insert = arg; return builder; },
    update(arg: any) { query.update = arg; return builder; },
    upsert(arg: any) { query.upsert = arg; return builder; },
    delete(arg: any) { query.delete = arg; return builder; },
    eq(...args: any[]) { query.eq = args; return builder; },
    neq(...args: any[]) { query.neq = args; return builder; },
    gt(...args: any[]) { query.gt = args; return builder; },
    gte(...args: any[]) { query.gte = args; return builder; },
    lt(...args: any[]) { query.lt = args; return builder; },
    lte(...args: any[]) { query.lte = args; return builder; },
    like(...args: any[]) { query.like = args; return builder; },
    ilike(...args: any[]) { query.ilike = args; return builder; },
    in(...args: any[]) { query.in = args; return builder; },
    is(...args: any[]) { query.is = args; return builder; },
    or(...args: any[]) { query.or = args; return builder; },
    filter(...args: any[]) { query.filter = args; return builder; },
    range(...args: any[]) { query.range = args; return builder; },
    order(...args: any[]) { query.order = args; return builder; },
    limit(...args: any[]) { query.limit = args; return builder; },
    single() {
      if (query.table === 'organizations') {
        return Promise.resolve({
          data: {
            security_settings: {
              session_timeout_mins: 60,
              max_sessions_per_user: 3,
              enforce_ip_restrictions: true,
              allowed_ip_ranges: ['192.168.1.0/24', '10.0.0.0/16'],
              enforce_device_restrictions: true,
              allowed_device_types: ['desktop', 'mobile'],
              require_reauth_for_sensitive: true,
              sensitive_actions: ['payment', 'user_management', 'api_keys']
            }
          },
          error: null
        });
      }
      if (query.table === 'organization_members') {
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
        });
      }
      return Promise.resolve({ data: null, error: null });
    },
    maybeSingle() { return builder.single(); },
    then: undefined // for promise-like chaining if needed
  };

  Object.assign(builder, methods);
  return builder;
}

const mockSupabase = {
  auth: {
    getUser: vi.fn() as Mock<[], Promise<UserResponse>>,
    signInWithPassword: vi.fn() as Mock<[SignInWithPasswordCredentials], Promise<AuthTokenResponsePassword>>,
    signInWithOAuth: vi.fn() as Mock<[SignInWithOAuthCredentials], Promise<AuthResponse>>,
    signUp: vi.fn() as Mock<[SignUpWithPasswordCredentials], Promise<AuthResponse>>,
    signOut: vi.fn() as Mock<[], Promise<{ error: AuthError | null }>>,
    resetPasswordForEmail: vi.fn() as Mock<[string, { redirectTo?: string }], Promise<{ data: Record<string, never>; error: AuthError | null }>>,
    updateUser: vi.fn() as Mock<[any], Promise<UserResponse>>,
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
      error: null,
    }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }) as Mock<[], Promise<{ data: { session: Session | null }; error: AuthError | null }>>,
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
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
function createMockBuilder() {
  const builder: any = {};
  const terminalMethods = [
    'select', 'insert', 'update', 'upsert', 'delete',
  ];
  const chainableMethods = [
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in', 'is', 'or', 'filter', 'range', 'order', 'limit',
    'single', 'maybeSingle',
  ];

  // Terminal methods return a promise by default
  terminalMethods.forEach((method) => {
    const fn: any = vi.fn(function (this: any, ...args: any[]) {
      // If a mockImplementation or mockResolvedValue is set, use it
      if (fn.getMockImplementation()) {
        return fn.getMockImplementation()!.apply(this, args);
      }
      if (fn.mock.results.length > 0) {
        const lastResult: any = fn.mock.results[fn.mock.results.length - 1].value;
        if (lastResult && typeof lastResult.then === 'function') {
          return lastResult;
        }
      }
      // Default: return a promise resolving to { data: null, error: null }
      return Promise.resolve({ data: null, error: null });
    });
    builder[method] = fn;
  });

  // Chainable methods return the builder for chaining
  chainableMethods.forEach((method) => {
    builder[method] = vi.fn(() => builder);
  });

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
  from: vi.fn().mockImplementation(() => createMockBuilder()),
};

// Cast the whole mock object for better type checking if possible
// Or rely on casting within tests: (supabase.auth.mfa.enroll as Mock).mockResolvedValueOnce(...)
export const supabase = mockSupabase as unknown as SupabaseClient; // Use casting carefully
// Remove CommonJS export
// module.exports = mockSupabase; 
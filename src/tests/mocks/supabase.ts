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

// Define the builder object with mockable action methods
const mockQueryBuilder = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
  // Modifier methods return 'this' for chaining
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  gt: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  is: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
  filter: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  // Add other modifier methods if needed by tests
};

// Default mock implementations for action methods to return a resolved promise
// Tests can override these with specific mockResolvedValueOnce/mockRejectedValueOnce
mockQueryBuilder.select.mockResolvedValue({ data: [], error: null });
mockQueryBuilder.insert.mockResolvedValue({ data: [], error: null });
mockQueryBuilder.update.mockResolvedValue({ data: [], error: null });
mockQueryBuilder.upsert.mockResolvedValue({ data: [], error: null });
mockQueryBuilder.delete.mockResolvedValue({ data: [], error: null });

const mockSupabase = {
  auth: {
    getUser: vi.fn() as Mock<[], Promise<UserResponse>>,
    signInWithPassword: vi.fn() as Mock<[SignInWithPasswordCredentials], Promise<AuthTokenResponsePassword>>,
    signInWithOAuth: vi.fn() as Mock<[SignInWithOAuthCredentials], Promise<AuthResponse>>,
    signUp: vi.fn() as Mock<[SignUpWithPasswordCredentials], Promise<AuthResponse>>,
    signOut: vi.fn() as Mock<[], Promise<{ error: AuthError | null }>>,
    resetPasswordForEmail: vi.fn() as Mock<[string, { redirectTo?: string }], Promise<{ data: Record<string, never>; error: AuthError | null }>>,
    updateUser: vi.fn() as Mock<[any], Promise<UserResponse>>, // Use specific type if known
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
      enroll: vi.fn() as Mock<[MFAEnrollParams], Promise<AuthMFAEnrollResponse>>, // Use correct response type
      unenroll: vi.fn() as Mock<[MFAUnenrollParams], Promise<AuthMFAUnenrollResponse>>,
      updateFactor: vi.fn(), // Add missing mock - Type later if needed
      verifyWithBackupCode: vi.fn(), // Add missing mock - Type later if needed
      // Add challengeAndVerify if needed by tests
    },
  },
  // Mock chained methods correctly
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
  rpc: vi.fn() as Mock<[string, unknown?], Promise<SupabaseRpcResponse>>, // Use the defined type alias
  channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn()
  }),
  // Use the predefined mockQueryBuilder - **REPLACED BELOW**
  // from: vi.fn().mockReturnValue(mockQueryBuilder), // Old implementation
  // from now returns a *new* instance of the builder mocks each time
  // This prevents tests interfering with each other's builder state
  from: vi.fn().mockImplementation(() => ({
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
    insert: vi.fn().mockResolvedValue({ data: [], error: null }),
    update: vi.fn().mockResolvedValue({ data: [], error: null }),
    upsert: vi.fn().mockResolvedValue({ data: [], error: null }),
    delete: vi.fn().mockResolvedValue({ data: [], error: null }),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    // Ensure all needed methods are here
  })),
};

// Cast the whole mock object for better type checking if possible
// Or rely on casting within tests: (supabase.auth.mfa.enroll as Mock).mockResolvedValueOnce(...)
export const supabase = mockSupabase as unknown as SupabaseClient; // Use casting carefully
// Remove CommonJS export
// module.exports = mockSupabase; 
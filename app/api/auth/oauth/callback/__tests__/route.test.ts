import { POST } from "../route";
// import { cookies } from 'next/headers'; // Mocked
// import { NextResponse } from 'next/server'; // Unused
import { OAuthProvider } from "@/types/oauth";
import { describe, it, expect, vi, beforeEach, MockedFunction } from "vitest";
// import { createServerClient } from '@supabase/ssr'; // Mocked
// import { prisma } from '@/lib/database/prisma'; // Mocked
import { logUserAction } from "@/lib/audit/auditLogger"; // Mocked, but type used

// --- Mocks ---

// 1. Mock next/headers cookies
const mockCookies = new Map<string, any>();
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (key: string) => mockCookies.get(key),
    set: (
      key: string | { name: string; [key: string]: any },
      value?: string | object,
    ) => {
      if (typeof key === "string") {
        mockCookies.set(key, {
          name: key,
          value: value,
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 600,
          path: "/",
          ...(typeof value === "object" ? value : {}),
        });
      } else {
        mockCookies.set(key.name, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          maxAge: 600,
          path: "/",
          ...key,
        });
      }
    },
    has: (key: string) => mockCookies.has(key),
    delete: (key: string) => mockCookies.delete(key),
    // Mocking `getAll` might be needed if Supabase client uses it internally
    getAll: () => Array.from(mockCookies.values()),
  }),
}));

// 2. Mock Supabase Client
const mockSupabaseAuth = {
  exchangeCodeForSession: vi.fn(),
  getSession: vi.fn(),
  getUser: vi.fn(),
  setSession: vi.fn(),
};
const mockSupabaseClient = {
  auth: mockSupabaseAuth,
  // Add other Supabase client parts if needed
};
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => mockSupabaseClient),
}));

// 3. Mock Prisma Client
const mockPrismaAccount = {
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};
vi.mock("@/lib/database/prisma", () => ({
  prisma: {
    account: mockPrismaAccount,
    // Add other models if needed
  },
}));

// 4. Mock Audit Logger
vi.mock("@/lib/audit/auditLogger", () => ({
  logUserAction: vi.fn(),
}));

const mockLogUserAction = logUserAction as MockedFunction<typeof logUserAction>; // For type safety

// --- Test Data ---
const validState = "valid-state-from-cookie";
const validCode = "valid-authorization-code";
const testEmail = "test@example.com";
const testProvider = OAuthProvider.GOOGLE;
const testProviderAccountId = "google-user-123";
const testUserId = "supabase-user-id-abc";
const testAccessToken = "mock-access-token";

const mockSupabaseUser = {
  id: testUserId,
  email: testEmail,
  app_metadata: {
    provider: "google",
    provider_id: testProviderAccountId,
    providers: ["google"],
  },
  user_metadata: { name: "Test User" },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockExistingUser = {
  id: "existing-user-id-xyz",
  // ... other user fields
};

const mockExistingAccount = {
  id: "account-id-1",
  user_id: mockExistingUser.id,
  provider: testProvider.toLowerCase(),
  provider_account_id: testProviderAccountId,
  provider_email: testEmail,
  users: mockExistingUser, // Include relation
};

// --- Test Suite ---

describe("POST /api/auth/oauth/callback", () => {
  beforeEach(() => {
    // Reset all mocks and cookies before each test
    vi.resetAllMocks();
    mockCookies.clear();
    // Set the valid state cookie for most tests
    mockCookies.set(`oauth_state_${testProvider}`, {
      name: `oauth_state_${testProvider}`,
      value: validState,
    });
  });

  // Helper to create request
  const createRequest = (body: Record<string, any>) => {
    return new Request("http://localhost/api/auth/oauth/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redirectUri: "http://localhost/callback", ...body }),
    });
  };

  it("should return 400 if state is missing", async () => {
    const request = createRequest({ provider: testProvider, code: validCode }); // No state
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.message).toContain("Invalid or missing state");
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILURE" }),
    );
  });

  it("should return 400 if state does not match cookie", async () => {
    const request = createRequest({
      provider: testProvider,
      code: validCode,
      state: "invalid-state",
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.message).toContain("Invalid or missing state");
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILURE" }),
    );
  });

  it("should return 409 if user already has a session", async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: { user: { id: "existing" } } },
      error: null,
    });

    const request = createRequest({
      provider: testProvider,
      code: validCode,
      state: validState,
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error.message).toContain("User already authenticated");
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILURE" }),
    );
  });

  it("should return 400 if code exchange fails", async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({
      data: null,
      error: { message: "Invalid code", status: 400 },
    });

    const request = createRequest({
      provider: testProvider,
      code: "invalid-code",
      state: validState,
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.message).toBe("Invalid code");
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILURE" }),
    );
  });

  it("should return 500 if session check fails", async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: null,
      error: { message: "boom" },
    });

    const request = createRequest({
      provider: testProvider,
      code: validCode,
      state: validState,
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.message).toContain("Failed to check current session");
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILURE" }),
    );
  });

  it("should return 400 with revoked message if provider access revoked", async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({
      data: null,
      error: { message: "Access revoked", status: 400 },
    });

    const request = createRequest({ provider: testProvider, code: validCode, state: validState });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.message).toContain("Access to your provider account has been revoked");
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILURE" }),
    );
  });

  it("should return 400 if fetching Supabase user fails after code exchange", async () => {
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: testAccessToken } },
      error: null,
    });
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: null,
      error: { message: "Failed to fetch", status: 500 },
    });

    const request = createRequest({
      provider: testProvider,
      code: validCode,
      state: validState,
    });
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.message).toBe("Failed to fetch");
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILURE" }),
    );
  });

  it("should successfully log in an existing user found via provider ID", async () => {
    // Setup mocks
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: testAccessToken } },
      error: null,
    });
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: mockSupabaseUser },
      error: null,
    });
    mockPrismaAccount.findUnique.mockResolvedValue(mockExistingAccount); // Found account
    mockPrismaAccount.findFirst.mockResolvedValue(null); // No email collision check needed

    // Make request
    const request = createRequest({
      provider: testProvider,
      code: validCode,
      state: validState,
    });
    const response = await POST(request);
    const body = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(body.data.user).toEqual(mockExistingUser);
    expect(body.data.token).toBe(testAccessToken);
    expect(body.data.isNewUser).toBe(false);
    expect(body.data.info).toContain("Logged in via linked provider account");

    expect(mockPrismaAccount.findUnique).toHaveBeenCalledWith({
      where: {
        provider_provider_account_id: {
          provider: testProvider.toLowerCase(),
          provider_account_id: testProviderAccountId,
        },
      },
      include: { users: true },
    });
    expect(mockPrismaAccount.create).not.toHaveBeenCalled(); // Should not create new account
    expect(mockPrismaAccount.update).not.toHaveBeenCalled(); // Email didn't change
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: testUserId,
        action: "SSO_LOGIN",
        status: "SUCCESS",
      }),
    );

    // cookie cleared and session stored
    const cleared = mockCookies.get(`oauth_state_${testProvider}`);
    expect(cleared?.value).toBe("");
    expect(mockSupabaseAuth.setSession).toHaveBeenCalledWith({
      access_token: testAccessToken,
      refresh_token: undefined,
    });
  });

  it("should create a new user and account if not found", async () => {
    // Setup mocks
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: testAccessToken } },
      error: null,
    });
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: mockSupabaseUser },
      error: null,
    });
    mockPrismaAccount.findUnique.mockResolvedValue(null); // No account found by provider ID
    mockPrismaAccount.findFirst.mockResolvedValue(null); // No email collision
    // Mock the creation - return value needs to match expected structure including `users` relation
    const createdAccount = {
      ...mockExistingAccount, // Use similar structure
      id: "new-account-id-456",
      user_id: testUserId,
      provider_account_id: testProviderAccountId,
      users: { ...mockExistingUser, id: testUserId }, // Link to the *new* supabase user ID
    };
    mockPrismaAccount.create.mockResolvedValue(createdAccount);

    // Make request
    const request = createRequest({
      provider: testProvider,
      code: validCode,
      state: validState,
    });
    const response = await POST(request);
    const body = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(body.data.user).toEqual(createdAccount.users);
    expect(body.data.token).toBe(testAccessToken);
    expect(body.data.isNewUser).toBe(true);
    expect(body.data.info).toContain("New provider account linked");

    expect(mockPrismaAccount.findUnique).toHaveBeenCalled();
    expect(mockPrismaAccount.findFirst).toHaveBeenCalled();
    expect(mockPrismaAccount.create).toHaveBeenCalledWith({
      data: {
        user_id: testUserId,
        provider: testProvider.toLowerCase(),
        provider_account_id: testProviderAccountId,
        provider_email: testEmail,
      },
      include: { users: true },
    });
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: testUserId,
        action: "SSO_LOGIN",
        status: "SUCCESS",
        details: expect.objectContaining({ isNewUser: true }),
      }),
    );
  });

  it("should return 409 on email collision", async () => {
    // Setup mocks
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: testAccessToken } },
      error: null,
    });
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: mockSupabaseUser },
      error: null,
    });
    mockPrismaAccount.findUnique.mockResolvedValue(null); // No account found by provider ID
    // Found account via email
    mockPrismaAccount.findFirst.mockResolvedValue({
      ...mockExistingAccount,
      provider: "password", // Belongs to a different provider
      provider_account_id: "",
    });

    // Make request
    const request = createRequest({
      provider: testProvider,
      code: validCode,
      state: validState,
    });
    const response = await POST(request);
    const body = await response.json();

    // Assertions
    expect(response.status).toBe(409);
    expect(body.error.message).toContain("account with this email already exists");
    expect(body.error.details?.collision).toBe(true);
    expect(mockPrismaAccount.create).not.toHaveBeenCalled();
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILURE" }),
    );
  });

  it("should successfully log in and update email on existing account if changed", async () => {
    // Setup mocks
    const oldEmail = "old.email@example.com";
    const accountWithOldEmail = {
      ...mockExistingAccount,
      provider_email: oldEmail,
    };
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: testAccessToken } },
      error: null,
    });
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: mockSupabaseUser },
      error: null,
    }); // Returns new email
    mockPrismaAccount.findUnique.mockResolvedValue(accountWithOldEmail); // Found account with old email
    mockPrismaAccount.update.mockResolvedValue({
      ...accountWithOldEmail,
      provider_email: testEmail,
    }); // Simulate successful update

    // Make request
    const request = createRequest({
      provider: testProvider,
      code: validCode,
      state: validState,
    });
    const response = await POST(request);
    const body = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(body.data.user).toEqual(mockExistingUser); // Should still return the original user linked
    expect(body.data.token).toBe(testAccessToken);
    expect(body.data.isNewUser).toBe(false);

    // Check that update was called correctly
    expect(mockPrismaAccount.update).toHaveBeenCalledTimes(1);
    expect(mockPrismaAccount.update).toHaveBeenCalledWith({
      where: { id: accountWithOldEmail.id },
      data: { provider_email: testEmail }, // Updated with the new email from provider
    });
    expect(mockPrismaAccount.create).not.toHaveBeenCalled();
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: testUserId,
        action: "SSO_LOGIN",
        status: "SUCCESS",
      }),
    );
  });

  it("should handle errors during prisma account update", async () => {
    // Setup mocks
    const oldEmail = "old.email@example.com";
    const accountWithOldEmail = {
      ...mockExistingAccount,
      provider_email: oldEmail,
    };
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: testAccessToken } },
      error: null,
    });
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: mockSupabaseUser },
      error: null,
    }); // Returns new email
    mockPrismaAccount.findUnique.mockResolvedValue(accountWithOldEmail); // Found account with old email
    const updateError = new Error("DB update failed");
    mockPrismaAccount.update.mockRejectedValue(updateError); // Simulate update failure

    // Make request
    const request = createRequest({
      provider: testProvider,
      code: validCode,
      state: validState,
    });
    const response = await POST(request);
    const body = await response.json();

    // Assertions
    expect(response.status).toBe(500); // Expecting internal server error
    expect(body.error.message).toBe(updateError.message);
    expect(mockPrismaAccount.update).toHaveBeenCalledTimes(1);
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "SSO_LOGIN",
        status: "FAILURE",
        details: { error: updateError.message },
      }),
    );
  });

  it("should handle errors during prisma account create", async () => {
    // Setup mocks for new user flow
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: testAccessToken } },
      error: null,
    });
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: mockSupabaseUser },
      error: null,
    });
    mockPrismaAccount.findUnique.mockResolvedValue(null); // Not found by provider ID
    mockPrismaAccount.findFirst.mockResolvedValue(null); // No email collision
    const createError = new Error("DB create failed");
    mockPrismaAccount.create.mockRejectedValue(createError); // Simulate create failure

    // Make request
    const request = createRequest({
      provider: testProvider,
      code: validCode,
      state: validState,
    });
    const response = await POST(request);
    const body = await response.json();

    // Assertions
    expect(response.status).toBe(500); // Expecting internal server error
    expect(body.error.message).toBe(createError.message);
    expect(mockPrismaAccount.create).toHaveBeenCalledTimes(1);
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "SSO_LOGIN",
        status: "FAILURE",
        details: { error: createError.message },
      }),
    );
  });

  it("should return 400 if provider returns neither email nor providerAccountId", async () => {
    // Setup mocks
    const userWithoutIds = {
      ...mockSupabaseUser,
      email: undefined, // No email
      app_metadata: {
        ...mockSupabaseUser.app_metadata,
        provider_id: undefined,
      }, // No provider ID
    };
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: testAccessToken } },
      error: null,
    });
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: userWithoutIds },
      error: null,
    });
    // Prisma calls shouldn't be reached

    // Make request
    const request = createRequest({
      provider: testProvider,
      code: validCode,
      state: validState,
    });
    const response = await POST(request);
    const body = await response.json();

    // Assertions
    expect(response.status).toBe(400);
    expect(body.error.message).toContain(
      "Provider did not return a unique identifier",
    );
    expect(mockPrismaAccount.findUnique).not.toHaveBeenCalled();
    expect(mockPrismaAccount.findFirst).not.toHaveBeenCalled();
    expect(mockPrismaAccount.create).not.toHaveBeenCalled();
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({ status: "FAILURE" }),
    );
  });

  it("should successfully create a new user using GitHub provider", async () => {
    const githubProvider = OAuthProvider.GITHUB;
    const githubProviderAccountId = "github-user-xyz";
    const githubEmail = "github@example.com";
    const githubSupabaseUser = {
      ...mockSupabaseUser,
      email: githubEmail,
      app_metadata: {
        provider: "github",
        provider_id: githubProviderAccountId,
        providers: ["github"],
      },
    };

    // Setup mocks
    mockCookies.set(`oauth_state_${githubProvider}`, {
      name: `oauth_state_${githubProvider}`,
      value: validState,
    }); // Set state cookie for GitHub
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockSupabaseAuth.exchangeCodeForSession.mockResolvedValue({
      data: { session: { access_token: testAccessToken } },
      error: null,
    });
    mockSupabaseAuth.getUser.mockResolvedValue({
      data: { user: githubSupabaseUser },
      error: null,
    });
    mockPrismaAccount.findUnique.mockResolvedValue(null); // Not found by provider ID
    mockPrismaAccount.findFirst.mockResolvedValue(null); // No email collision
    const createdAccount = {
      id: "new-github-account",
      user_id: githubSupabaseUser.id,
      users: { id: githubSupabaseUser.id },
    };
    mockPrismaAccount.create.mockResolvedValue(createdAccount);

    // Make request
    const request = createRequest({
      provider: githubProvider,
      code: validCode,
      state: validState,
    });
    const response = await POST(request);
    const body = await response.json();

    // Assertions
    expect(response.status).toBe(200);
    expect(body.data.isNewUser).toBe(true);
    expect(body.data.user).toEqual(createdAccount.users);
    expect(mockPrismaAccount.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          provider: githubProvider.toLowerCase(),
          provider_account_id: githubProviderAccountId,
          provider_email: githubEmail,
        }),
      }),
    );
    expect(mockLogUserAction).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "SUCCESS",
        details: expect.objectContaining({ provider: githubProvider }),
      }),
    );
  });

  // TODO: Add more tests:
  // - PKCE validation test (if applicable for any provider used in the route)
});

import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";
import { OAuthProvider } from "@/types/oauth";
import { logUserAction } from "@/lib/audit/auditLogger";
import {
  createSuccessResponse,
  withErrorHandling,
  withValidation,
  ApiError,
  ERROR_CODES,
} from "@/lib/api/common";

// Request schema
const callbackRequestSchema = z.object({
  provider: z.nativeEnum(OAuthProvider),
  code: z.string(),
  redirectUri: z.string().url(),
  state: z.string().optional(), // Add state for CSRF protection
});

async function handleCallback(
  req: NextRequest,
  data: z.infer<typeof callbackRequestSchema>,
) {
  const { provider, code, state } = data;

  const cookieStore = cookies();
  const stateCookie = cookieStore.get(`oauth_state_${provider}`)?.value;
  if (!state || !stateCookie || state !== stateCookie) {
    throw new ApiError(
      ERROR_CODES.INVALID_REQUEST,
      "Invalid or missing state parameter. Possible CSRF attack.",
      400,
    );
  }
  cookieStore.set({
    name: `oauth_state_${provider}`,
    value: "",
    maxAge: 0,
    path: "/",
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    },
  );

  const { data: currentSession, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError) {
    throw new ApiError(
      ERROR_CODES.INTERNAL_ERROR,
      "Failed to check current session.",
      500,
    );
  }
  if (currentSession?.session) {
    throw new ApiError(
      ERROR_CODES.INVALID_REQUEST,
      "User already authenticated. Use the account linking endpoint to link a new provider.",
      409,
    );
  }

  const { data: sessionData, error } =
    await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    if (error.message && error.message.toLowerCase().includes("revoked")) {
      throw new ApiError(
        ERROR_CODES.OAUTH_ERROR,
        "Access to your provider account has been revoked. Please re-link your account or use another login method.",
        400,
      );
    }
    throw new ApiError(ERROR_CODES.OAUTH_ERROR, error.message, 400);
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new ApiError(
      ERROR_CODES.OAUTH_ERROR,
      userError?.message || "Failed to fetch user data",
      400,
    );
  }

  const { prisma } = await import("@/lib/database/prisma");
  const providerAccountId = userData.user.app_metadata?.provider_id;
  const email = userData.user.email;
  if (!providerAccountId && !email) {
    throw new ApiError(
      ERROR_CODES.OAUTH_ERROR,
      "Provider did not return a unique identifier (email or provider user ID).",
      400,
    );
  }

  let account = null;
  if (providerAccountId) {
    account = await prisma.account.findUnique({
      where: {
        provider_provider_account_id: {
          provider: provider.toLowerCase(),
          provider_account_id: providerAccountId,
        },
      },
      include: { users: true },
    });
  }

  if (account) {
    if (email && account.provider_email !== email) {
      await prisma.account.update({
        where: { id: account.id },
        data: { provider_email: email },
      });
    }

    await logUserAction({
      userId: userData.user.id,
      action: "SSO_LOGIN",
      status: "SUCCESS",
      targetResourceType: "auth",
      targetResourceId: userData.user.id,
      details: { provider, email, isNewUser: false },
    });

    return createSuccessResponse({
      user: account.users,
      token: sessionData.session?.access_token,
      isNewUser: false,
      info: "Logged in via linked provider account.",
    });
  }

  let emailCollision = null;
  if (email) {
    emailCollision = await prisma.account.findFirst({
      where: { provider_email: email },
      include: { users: true },
    });
  }
  if (emailCollision) {
    await logUserAction({
      action: "SSO_LOGIN",
      status: "FAILURE",
      details: { error: "email collision" },
    });
    throw new ApiError(
      ERROR_CODES.CONFLICT,
      "An account with this email already exists. Please log in and link your provider from your account settings.",
      409,
      { collision: true },
    );
  }

  const newAccount = await prisma.account.create({
    data: {
      user_id: userData.user.id,
      provider: provider.toLowerCase(),
      provider_account_id: providerAccountId || "",
      provider_email: email || "",
    },
    include: { users: true },
  });

  await logUserAction({
    userId: userData.user.id,
    action: "SSO_LOGIN",
    status: "SUCCESS",
    targetResourceType: "auth",
    targetResourceId: userData.user.id,
    details: { provider, email, isNewUser: true },
  });

  return createSuccessResponse({
    user: newAccount.users,
    token: sessionData.session?.access_token,
    isNewUser: true,
    info: "New provider account linked and user created.",
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(
    async (req) => withValidation(callbackRequestSchema, handleCallback, req),
    request,
  );
}

import { type NextRequest } from "next/server";
import { z } from "zod";
import { logUserAction } from "@/lib/audit/auditLogger";
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES,
} from "@/lib/api/common";
import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import type { ServiceContainer } from '@/core/config/interfaces';

// Zod schema for account deletion request
const DeleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, { message: "Password confirmation is required." }),
});

async function handleDeleteAccount(
  req: NextRequest,
  { userId }: { userId: string },
  data: z.infer<typeof DeleteAccountSchema>,
  services: ServiceContainer
) {
  const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  let currentUserId: string | undefined;
  let userEmail: string | undefined;

  try {
    // 1. Get AuthService
    const authService = services.auth;

    // 2. Get current user
    const user = await authService.getCurrentUser();

    if (!user) {
      throw new ApiError(
        ERROR_CODES.UNAUTHORIZED,
        "User not authenticated",
        401,
      );
    }

    currentUserId = user.id;
    userEmail = user.email;

    if (!userEmail) {
      throw new ApiError(
        ERROR_CODES.INVALID_REQUEST,
        "User email not found, cannot verify password.",
        400,
      );
    }

    // 3. Parse and Validate Body
    const { password } = data;

    console.log("Account deletion attempt initiated for user:", currentUserId);

    // Log the account deletion attempt
    await logUserAction({
      userId: currentUserId,
      action: "ACCOUNT_DELETION_INITIATED",
      status: "PENDING",
      ipAddress,
      userAgent,
      targetResourceType: "account",
      targetResourceId: currentUserId,
    });

    // 4. Delete account using the AuthService
    const result = await authService.deleteAccount({
      userId: currentUserId,
      password,
    });

    // 5. Handle the result
    if (!result.success) {
      console.error("Account deletion failed for user:", userId, result.error);

      // Log the failed deletion
      await logUserAction({
        userId: currentUserId,
        action: "ACCOUNT_DELETION_FAILED",
        status: "FAILURE",
        ipAddress,
        userAgent,
        targetResourceType: "account",
        targetResourceId: currentUserId,
        details: { error: result.error },
      });

      // Return appropriate error based on the error type
      if (result.error === "INVALID_PASSWORD") {
        throw new ApiError(
          ERROR_CODES.UNAUTHORIZED,
          "Incorrect password provided.",
          401,
        );
      } else {
        throw new ApiError(
          ERROR_CODES.INTERNAL_ERROR,
          result.error || "Account deletion failed.",
          500,
        );
      }
    }

    // Log the successful deletion
    await logUserAction({
      action: "ACCOUNT_DELETION_COMPLETED",
      status: "SUCCESS",
      ipAddress,
      userAgent,
      targetResourceType: "account",
      targetResourceId: currentUserId,
    });

    console.log("Account deletion successful for user:", currentUserId);

    // Return success
    // Client should handle redirecting or signing out locally
    return createSuccessResponse({ message: "Account successfully deleted." });
  } catch (error) {
    // Handle Unexpected Errors
    console.error("Account deletion process error for user:", currentUserId, error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // Log the error
    await logUserAction({
      userId: currentUserId,
      action: "ACCOUNT_DELETION_ERROR",
      status: "FAILURE",
      ipAddress,
      userAgent,
      targetResourceType: "account",
      targetResourceId: currentUserId,
      details: { error: message },
    });

    // Avoid sending specific details unless it was a known validation/auth error handled above
    throw new ApiError(
      ERROR_CODES.INTERNAL_ERROR,
      "Account deletion failed due to an unexpected error.",
      500,
    );
  }
}

export const DELETE = createApiHandler(
  DeleteAccountSchema,
  handleDeleteAccount,
  {
    requireAuth: true,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 30 },
  }
);

// GET handler to fetch account info
async function handleGetAccount(
  req: NextRequest,
  { userId }: { userId: string },
  _data: unknown,
  services: ServiceContainer
) {
  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    const authService = services.auth;

    // Get user account details
    const accountDetails = await authService.getUserAccount(userId);

    // Log the account info request
    await logUserAction({
      userId,
      action: 'ACCOUNT_INFO_REQUESTED',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'account',
      targetResourceId: userId,
    });

    return createSuccessResponse(accountDetails);
  } catch (error) {
    console.error("Error fetching account info:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // Log the error
    await logUserAction({
      action: "ACCOUNT_INFO_ERROR",
      status: "FAILURE",
      ipAddress,
      userAgent,
      targetResourceType: "account",
      details: { error: message },
    });

    throw new ApiError(
      ERROR_CODES.INTERNAL_ERROR,
      "Failed to fetch account information",
      500,
    );
  }
}

export const GET = createApiHandler(
  emptySchema,
  handleGetAccount,
  {
    requireAuth: true,
    rateLimit: { windowMs: 15 * 60 * 1000, max: 30 },
  }
);

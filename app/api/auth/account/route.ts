import { type NextRequest } from "next/server";
import { z } from "zod";
import { withSecurity } from "@/middleware/security";
import { withAuthRateLimit } from "@/middleware/rate-limit";
import { getApiAuthService } from "@/services/auth/factory";
import { logUserAction } from "@/lib/audit/auditLogger";
import {
  createSuccessResponse,
  withErrorHandling,
  withValidation,
  ApiError,
  ERROR_CODES,
} from "@/lib/api/common";

// Zod schema for account deletion request
const DeleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, { message: "Password confirmation is required." }),
});

async function handleDeleteAccount(
  req: NextRequest,
  data: z.infer<typeof DeleteAccountSchema>,
) {
  const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  let userId: string | undefined;
  let userEmail: string | undefined;

  try {
    // 1. Get AuthService
    const authService = getApiAuthService();

    // 2. Get current user
    const user = await authService.getCurrentUser();

    if (!user) {
      throw new ApiError(
        ERROR_CODES.UNAUTHORIZED,
        "User not authenticated",
        401,
      );
    }

    userId = user.id;
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

    console.log("Account deletion attempt initiated for user:", userId);

    // Log the account deletion attempt
    await logUserAction({
      userId,
      action: "ACCOUNT_DELETION_INITIATED",
      status: "PENDING",
      ipAddress,
      userAgent,
      targetResourceType: "account",
      targetResourceId: userId,
    });

    // 4. Delete account using the AuthService
    const result = await authService.deleteAccount({
      userId,
      password,
    });

    // 5. Handle the result
    if (!result.success) {
      console.error("Account deletion failed for user:", userId, result.error);

      // Log the failed deletion
      await logUserAction({
        userId,
        action: "ACCOUNT_DELETION_FAILED",
        status: "FAILURE",
        ipAddress,
        userAgent,
        targetResourceType: "account",
        targetResourceId: userId,
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
      targetResourceId: userId,
    });

    console.log("Account deletion successful for user:", userId);

    // Return success
    // Client should handle redirecting or signing out locally
    return createSuccessResponse({ message: "Account successfully deleted." });
  } catch (error) {
    // Handle Unexpected Errors
    console.error("Account deletion process error for user:", userId, error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // Log the error
    await logUserAction({
      userId,
      action: "ACCOUNT_DELETION_ERROR",
      status: "FAILURE",
      ipAddress,
      userAgent,
      targetResourceType: "account",
      targetResourceId: userId,
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

// Apply rate limiting and security middleware
async function deleteHandler(req: NextRequest) {
  return withErrorHandling(
    async (r) => withValidation(DeleteAccountSchema, handleDeleteAccount, r),
    req,
  );
}

export const DELETE = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, deleteHandler),
);

// GET handler to fetch account info
async function handleGetAccount(req: NextRequest) {
  const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    // Get AuthService
    const authService = getApiAuthService();

    // Get current user
    const user = await authService.getCurrentUser();

    if (!user) {
      throw new ApiError(
        ERROR_CODES.UNAUTHORIZED,
        "User not authenticated",
        401,
      );
    }

    // Get user account details
    const accountDetails = await authService.getUserAccount(user.id);

    // Log the account info request
    await logUserAction({
      userId: user.id,
      action: "ACCOUNT_INFO_REQUESTED",
      status: "SUCCESS",
      ipAddress,
      userAgent,
      targetResourceType: "account",
      targetResourceId: user.id,
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

// Apply rate limiting and security middleware for GET
async function getHandler(req: NextRequest) {
  return withErrorHandling(handleGetAccount, req);
}

export const GET = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, getHandler),
);

import { NextRequest } from "next/server";
import { z } from "zod";
import { TwoFactorMethod } from "@/types/2fa";
import { getApiAuthService } from "@/lib/api/auth/factory";
import { logUserAction } from "@/lib/audit/auditLogger";
import { withAuthRateLimit } from "@/middleware/rate-limit";
import { withSecurity } from "@/middleware/security";
import {
  createSuccessResponse,
  withErrorHandling,
  withValidation,
  ApiError,
  ERROR_CODES,
} from "@/lib/api/common";

// Request schema for MFA verification
const mfaVerifySchema = z.object({
  code: z.string().min(6).max(8),
  method: z.nativeEnum(TwoFactorMethod).default(TwoFactorMethod.TOTP),
  accessToken: z.string(), // Temporary access token from initial login
  rememberDevice: z.boolean().optional(),
});

async function handleMfaVerify(
  req: NextRequest,
  data: z.infer<typeof mfaVerifySchema>,
) {
  const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const { code, method, accessToken, rememberDevice } = data;

    // Get AuthService
    const authService = getApiAuthService();

    // Verify MFA code using the AuthService
    const verifyResult = await authService.verifyMfaCode({
      code,
      method,
      accessToken,
      rememberDevice: rememberDevice || false,
    });

    // Log the MFA verification attempt
    await logUserAction({
      action: "MFA_VERIFICATION_ATTEMPT",
      status: verifyResult.success ? "SUCCESS" : "FAILURE",
      ipAddress,
      userAgent,
      targetResourceType: "auth",
      details: {
        method,
        error: verifyResult.error || null,
      },
    });

    if (!verifyResult.success || !verifyResult.user || !verifyResult.session) {
      console.error("MFA verification failed:", verifyResult.error);
      throw new ApiError(
        ERROR_CODES.INVALID_REQUEST,
        verifyResult.error || "MFA verification failed",
        400,
      );
    }

    // Get user from result
    const { user } = verifyResult;

    // Get session from result
    const { session } = verifyResult;

    // Return full authenticated session
    return createSuccessResponse({
      user,
      token: session.access_token,
      expiresAt: session.expires_at,
      rememberDevice: !!rememberDevice,
    });
  } catch (error) {
    console.error("Error in MFA verification:", error);

    // Log the error
    await logUserAction({
      action: "MFA_VERIFICATION_ERROR",
      status: "FAILURE",
      ipAddress,
      userAgent,
      targetResourceType: "auth",
      details: {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
    });

    throw new ApiError(
      ERROR_CODES.INTERNAL_ERROR,
      error instanceof Error ? error.message : "An unexpected error occurred",
      500,
    );
  }
}

// Apply rate limiting and security middleware
async function handler(req: NextRequest) {
  return withErrorHandling(
    async (r) => withValidation(mfaVerifySchema, handleMfaVerify, r),
    req,
  );
}

export const POST = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, handler),
);

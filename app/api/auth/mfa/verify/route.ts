import { z } from "zod";
import { TwoFactorMethod } from "@/types/2fa";
import { createApiHandler } from "@/lib/api/routeHelpers";
import { logUserAction } from "@/lib/audit/auditLogger";
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES,
} from "@/lib/api/common";

// Request schema for MFA verification
const mfaVerifySchema = z.object({
  code: z.string().min(6).max(8),
  method: z.nativeEnum(TwoFactorMethod).optional(),
  accessToken: z.string(), // Temporary access token from initial login
  rememberDevice: z.boolean().optional(),
});

/**
 * POST handler for MFA verification endpoint
 */
export const POST = createApiHandler(
  mfaVerifySchema,
  async (request, _authContext, data, services) => {
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    try {
      const { code, method, accessToken, rememberDevice } = data;

      // Apply default for method if not provided
      const mfaMethod = method ?? TwoFactorMethod.TOTP;

      // Verify MFA code using the AuthService
      const verifyResult = await services.auth.verifyMfaCode({
        code,
        method: mfaMethod,
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
  },
  { 
    requireAuth: false, // MFA verification doesn't require full auth yet
    rateLimit: { windowMs: 15 * 60 * 1000, max: 10 }
  }
);

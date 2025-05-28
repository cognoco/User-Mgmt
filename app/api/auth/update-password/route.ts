import { type NextRequest } from "next/server";
import { z } from "zod";
import { withSecurity } from "@/middleware/with-security";
import { logUserAction } from "@/lib/audit/auditLogger";
import { getApiAuthService } from "@/services/auth/factory";
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES,
} from "@/lib/api/common";
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  validationMiddleware,
  rateLimitMiddleware,
} from "@/middleware/createMiddlewareChain";

// Zod schema for password update
const UpdatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"|,.<>/?]/, {
      message: 'Password must contain at least one special character',
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  token: z.string().optional(),
});

async function handleUpdatePassword(
  req: NextRequest,
  data: z.infer<typeof UpdatePasswordSchema>,
) {
  const ipAddress = req.ip || req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  let userIdForLogging: string | null = null;

  const authService = getApiAuthService();

  try {
    if (data.token) {
      const result = await authService.updatePasswordWithToken(data.token, data.password);
      userIdForLogging = result.user?.id || null;
      if (!result.success) {
        throw new ApiError(
          ERROR_CODES.INVALID_REQUEST,
          result.error || 'Failed to update password',
          400
        );
      }
    } else {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        await logUserAction({
          action: "PASSWORD_UPDATE_UNAUTHORIZED",
          status: "FAILURE",
          ipAddress,
          userAgent,
          targetResourceType: "auth",
          details: { reason: "No user session found" },
        });
        throw new ApiError(ERROR_CODES.UNAUTHORIZED, "Unauthorized", 401);
      }
      userIdForLogging = currentUser.id;
      await authService.updatePassword("", data.password);
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update password";
    await logUserAction({
      userId: userIdForLogging,
      action: "PASSWORD_UPDATE_FAILURE",
      status: "FAILURE",
      ipAddress,
      userAgent,
      targetResourceType: "auth",
      targetResourceId: userIdForLogging,
      details: { reason: errorMessage },
    });
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, errorMessage, 400);
  }

  await logUserAction({
    userId: userIdForLogging,
    action: "PASSWORD_UPDATE_SUCCESS",
    status: "SUCCESS",
    ipAddress,
    userAgent,
    targetResourceType: "auth",
    targetResourceId: userIdForLogging,
  });

  return createSuccessResponse({ message: "Password updated successfully" });
}

const middleware = createMiddlewareChain([
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 30 }),
  errorHandlingMiddleware(),
  validationMiddleware(UpdatePasswordSchema),
]);

export const POST = withSecurity((request: NextRequest) =>
  middleware(handleUpdatePassword)(request),
);

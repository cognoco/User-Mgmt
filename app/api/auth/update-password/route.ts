import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuthRateLimit } from "@/middleware/with-auth-rate-limit";
import { withSecurity } from "@/middleware/with-security";
import { logUserAction } from "@/lib/audit/auditLogger";
import { getApiAuthService } from "@/lib/api/auth/factory";
import {
  createSuccessResponse,
  withErrorHandling,
  withValidation,
  ApiError,
  ERROR_CODES,
} from "@/lib/api/common";

// Zod schema for password update
const UpdatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});

async function handleUpdatePassword(
  req: NextRequest,
  data: z.infer<typeof UpdatePasswordSchema>,
) {
  const ipAddress = req.ip || req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  let userIdForLogging: string | null = null;

  const authService = getApiAuthService();
  const currentUser = authService.getCurrentUser();

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

  try {
    await authService.updatePassword("", data.password);
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

async function handler(request: NextRequest) {
  return withErrorHandling(
    async (req) =>
      withValidation(UpdatePasswordSchema, handleUpdatePassword, req),
    request,
  );
}

export const POST = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, handler),
);

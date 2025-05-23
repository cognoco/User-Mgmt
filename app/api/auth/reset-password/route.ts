import { type NextRequest } from "next/server";
import { z } from "zod";
import { withAuthRateLimit } from "@/middleware/with-auth-rate-limit";
import { withSecurity } from "@/middleware/with-security";
import { logUserAction } from "@/lib/audit/auditLogger";
import { getApiAuthService } from "@/services/auth/factory";
import {
  createSuccessResponse,
  withErrorHandling,
  withValidation,
} from "@/lib/api/common";

// Zod schema for password reset request
const ResetRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

async function handlePasswordReset(
  req: NextRequest,
  data: z.infer<typeof ResetRequestSchema>,
) {
  const ipAddress = req.ip || req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  const { email } = data;

  const authService = getApiAuthService();
  const resetResult = await authService.resetPassword(email);

  await logUserAction({
    action: "PASSWORD_RESET_REQUEST",
    status: resetResult.success ? "INITIATED" : "FAILURE",
    ipAddress,
    userAgent,
    targetResourceType: "auth",
    targetResourceId: email,
    details: { error: resetResult.error || null },
  });

  if (!resetResult.success) {
    console.error(
      "Password reset error (will still return generic success):",
      resetResult.error,
    );
  }

  return createSuccessResponse({
    message:
      "If an account exists with this email, you will receive password reset instructions.",
  });
}

async function handler(request: NextRequest) {
  return withErrorHandling(
    async (req) => withValidation(ResetRequestSchema, handlePasswordReset, req),
    request,
  );
}

export const POST = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, handler),
);

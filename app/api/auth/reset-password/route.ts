import { type NextRequest } from "next/server";
import { z } from "zod";
import { withSecurity } from "@/middleware/with-security";
import { logUserAction } from "@/lib/audit/auditLogger";
import { getApiAuthService } from "@/services/auth/factory";
import {
  createSuccessResponse,
} from "@/lib/api/common";
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  validationMiddleware,
  rateLimitMiddleware,
} from "@/middleware/createMiddlewareChain";

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

const middleware = createMiddlewareChain([
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 30 }),
  errorHandlingMiddleware(),
  validationMiddleware(ResetRequestSchema),
]);

export const POST = withSecurity((request: NextRequest) =>
  middleware(handlePasswordReset)(request),
);

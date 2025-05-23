import { type NextRequest } from "next/server";
import { checkRateLimit } from "@/middleware/rate-limit";
import { getApiAuthService } from "@/services/auth/factory";
import { logUserAction } from "@/lib/audit/auditLogger";
import {
  createSuccessResponse,
  withErrorHandling,
  ApiError,
  ERROR_CODES,
} from "@/lib/api/common";

async function handleLogout(req: NextRequest) {
  const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  const isRateLimited = await checkRateLimit(req);
  if (isRateLimited) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, "Too many requests", 429);
  }

  const authService = getApiAuthService();
  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id;

  await authService.logout();

  if (userId) {
    await logUserAction({
      userId,
      action: "LOGOUT_SUCCESS",
      status: "SUCCESS",
      ipAddress,
      userAgent,
      targetResourceType: "auth",
      targetResourceId: userId,
    });
  }

  console.log("Logout successful");
  return createSuccessResponse({ message: "Successfully logged out" });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(handleLogout, request);
}

import { type NextRequest } from "next/server";
import { withAuthRateLimit } from "@/middleware/with-auth-rate-limit";
import { withSecurity } from "@/middleware/with-security";
import { getApiAuthService } from "@/services/auth/factory";
import { logUserAction } from "@/lib/audit/auditLogger";
import {
  createSuccessResponse,
  withErrorHandling,
  ApiError,
  ERROR_CODES,
} from "@/lib/api/common";
import { NextResponse } from "next/server";

async function handleLogout(req: NextRequest) {
  const ipAddress = req.headers.get("x-forwarded-for") || "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  const authService = getApiAuthService();
  const currentUser = await authService.getCurrentUser();
  const userId = currentUser?.id;

  await authService.logout();
  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");

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
  const headers = {
    "Set-Cookie": "auth_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
  };

  if (callbackUrl) {
    const res = NextResponse.redirect(callbackUrl);
    Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  }

  return createSuccessResponse(
    { message: "Successfully logged out" },
    200,
    undefined,
    headers
  );
}

export const POST = withSecurity(async (request: NextRequest) =>
  withAuthRateLimit(request, (req) => withErrorHandling(handleLogout, req))
);

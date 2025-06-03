import { NextResponse } from "next/server";
import { createApiHandler, emptySchema } from "@/lib/api/route-helpers";
import { logUserAction } from "@/lib/audit/auditLogger";
import { createSuccessResponse } from "@/lib/api/common";

/**
 * POST handler for logout endpoint
 */
export const POST = createApiHandler(
  emptySchema,
  async (request, authContext, _data, services) => {
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";
    const userId = authContext.userId;

    await services.auth.logout();
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");

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
  },
  { 
    requireAuth: false, // Logout can work with or without auth
    rateLimit: { windowMs: 15 * 60 * 1000, max: 50 }
  }
);

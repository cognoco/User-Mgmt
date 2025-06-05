import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getApiCompanyService } from "@/services/company/factory";
import { type RouteAuthContext } from "@/middleware/auth";
import { createApiHandler } from "@/lib/api/route-helpers";



async function handlePost(
  _request: NextRequest,
  params: { id: string },
  auth: RouteAuthContext
) {
  try {
    const userId = auth.userId!;

    const companyService = getApiCompanyService();
    const result = await companyService.initiateDomainVerification(
      params.id,
      userId,
    );

    return NextResponse.json({
      domain: result.domain,
      verificationToken: result.verificationToken,
      message:
        "Domain verification initiated. Add the token as a TXT record in your DNS.",
    });
  } catch (error) {
    console.error("Unexpected error in initiate domain verification:", error);
    const message = (error as Error).message || 'An internal server error occurred.';
    const status = message.includes('not found')
      ? 404
      : message.includes('permission')
        ? 403
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export const POST = (req: NextRequest, ctx: { params: { id: string } }) =>
  createApiHandler(
    z.object({}),
    (r, a) => handlePost(r, ctx.params, a),
    { requireAuth: true }
  )(req);

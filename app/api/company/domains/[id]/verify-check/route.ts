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
    const result = await companyService.checkDomainVerification(params.id, userId);

    if (result.verified) {
      return NextResponse.json({ verified: true, message: result.message });
    }

    return NextResponse.json(
      { verified: false, message: result.message },
      { status: 400 },
    );
  } catch (error) {
    console.error("Unexpected error in domain verification:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 },
    );
  }
}

export const POST = (req: NextRequest, ctx: { params: { id: string } }) =>
  createApiHandler(
    z.object({}),
    (r, a) => handlePost(r, ctx.params, a),
    { requireAuth: true }
  )(req);

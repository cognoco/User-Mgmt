import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/database/supabase";
import { getApiCompanyService } from "@/services/company/factory";
import { type RouteAuthContext } from "@/middleware/auth";
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  rateLimitMiddleware,
  validationMiddleware,
} from "@/middleware/createMiddlewareChain";
import { addressCreateSchema } from "@/core/address/models";
import { createSupabaseAddressProvider } from "@/adapters/address/factory";

import { z } from "zod";
type AddressRequest = z.infer<typeof addressCreateSchema>;

const baseMiddleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
]);

const postMiddleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(addressCreateSchema),
]);

async function handlePost(
  _request: NextRequest,
  auth: RouteAuthContext,
  data: AddressRequest,
) {
  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;

    const companyService = getApiCompanyService();
    const companyProfile = await companyService.getProfileByUserId(userId);

    if (!companyProfile) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 },
      );
    }

    const addressProvider = createSupabaseAddressProvider(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    );

    const result = await addressProvider.createAddress(companyProfile.id, data);

    if (!result.success) {
      console.error("Error creating address:", result.error);
      return NextResponse.json(
        { error: "Failed to create address" },
        { status: 500 },
      );
    }

    return NextResponse.json(result.address);
  } catch (error) {
    console.error("Unexpected error in POST /api/company/addresses:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}

async function handleGet(_request: NextRequest, auth: RouteAuthContext) {
  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;

    const companyService = getApiCompanyService();
    const companyProfile = await companyService.getProfileByUserId(userId);

    if (!companyProfile) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 },
      );
    }

    const addressProvider = createSupabaseAddressProvider(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    );

    const addresses = await addressProvider.getAddresses(companyProfile.id);

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Unexpected error in GET /api/company/addresses:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}

export const POST = postMiddleware(handlePost);
export const GET = baseMiddleware(handleGet);

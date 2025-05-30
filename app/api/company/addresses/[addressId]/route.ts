import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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
import { addressUpdateSchema } from "@/core/address/models";
import { createSupabaseAddressProvider } from "@/adapters/address/factory";

// Use the shared address update schema from the core layer
type AddressUpdateRequest = z.infer<typeof addressUpdateSchema>;

const baseMiddleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
]);

const putMiddleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(addressUpdateSchema),
]);

async function handlePut(
  _request: NextRequest,
  params: { addressId: string },
  auth: RouteAuthContext,
  data: AddressUpdateRequest,
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

    const result = await addressProvider.updateAddress(
      companyProfile.id,
      params.addressId,
      data,
    );

    if (!result.success) {
      console.error("Error updating address:", result.error);
      return NextResponse.json(
        { error: "Failed to update address" },
        { status: 500 },
      );
    }

    return NextResponse.json(result.address);
  } catch (error) {
    console.error(
      "Unexpected error in PUT /api/company/addresses/[addressId]:",
      error,
    );
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}

async function handleDelete(
  _request: NextRequest,
  params: { addressId: string },
  auth: RouteAuthContext,
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

    const result = await addressProvider.deleteAddress(
      companyProfile.id,
      params.addressId,
    );

    if (!result.success) {
      console.error("Error deleting address:", result.error);
      return NextResponse.json(
        { error: "Failed to delete address" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Unexpected error in DELETE /api/company/addresses/[addressId]:",
      error,
    );
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}

export const PUT = (req: NextRequest, ctx: { params: { addressId: string } }) =>
  putMiddleware((r, auth, data) => handlePut(r, ctx.params, auth, data))(req);

export const DELETE = (
  req: NextRequest,
  ctx: { params: { addressId: string } },
) => baseMiddleware((r, auth) => handleDelete(r, ctx.params, auth))(req);

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { AuthContext } from "@/core/config/interfaces";
import { addressUpdateSchema } from "@/core/address/models";
import { createApiHandler } from "@/lib/api/routeHelpers";
import { createSuccessResponse } from "@/lib/api/common";
import { getApiAddressService } from "@/services/address/factory";
import { getApiCompanyService } from "@/services/company/factory";

// Use the shared address update schema from the core layer
type AddressUpdateRequest = z.infer<typeof addressUpdateSchema>;

async function handlePut(
  _request: NextRequest,
  params: { addressId: string },
  auth: AuthContext,
  data: AddressUpdateRequest,
) {
  try {
    const userId = auth.userId!;
    const companyService = getApiCompanyService();
    const addressService = getApiAddressService();
    const companyProfile = await companyService.getProfileByUserId(userId);

    if (!companyProfile) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 },
      );
    }

    const result = await addressService.updateAddress(
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

    return createSuccessResponse(result.address);
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
  auth: AuthContext,
) {
  try {
    const userId = auth.userId!;
    const companyService = getApiCompanyService();
    const addressService = getApiAddressService();
    const companyProfile = await companyService.getProfileByUserId(userId);

    if (!companyProfile) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 },
      );
    }

    const result = await addressService.deleteAddress(
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

    return createSuccessResponse({ success: true });
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
  createApiHandler(
    addressUpdateSchema,
    (r, auth, data) => handlePut(r, ctx.params, auth, data),
    { requireAuth: true }
  )(req);

export const DELETE = (
  req: NextRequest,
  ctx: { params: { addressId: string } }
) =>
  createApiHandler(
    z.object({}),
    (r, auth, d) => handleDelete(r, ctx.params, auth),
    { requireAuth: true }
  )(req);

import { NextRequest, NextResponse } from "next/server";
import { type RouteAuthContext } from "@/middleware/auth";
import { addressCreateSchema } from "@/core/address/models";
import { createApiHandler } from "@/lib/api/routeHelpers";
import { createSuccessResponse } from "@/lib/api/common";
import { getApiAddressService } from "@/services/address/factory";
import { getApiCompanyService } from "@/services/company/factory";

import { z } from "zod";
type AddressRequest = z.infer<typeof addressCreateSchema>;

async function handlePost(
  _request: NextRequest,
  auth: RouteAuthContext,
  data: AddressRequest,
) {
  try {
    const userId = auth.userId!;
    const companyService = getApiCompanyService();
    const addressService = getApiAddressService();
    const companyProfile = await companyService.getProfileByUserId(userId);
    if (!companyProfile) {
      return NextResponse.json(
        { error: 'Company profile not found' },
        { status: 404 },
      );
    }

    const result = await addressService.createAddress(
      companyProfile.id,
      data,
    );

    if (!result.success || !result.address) {
      console.error('Error creating address:', result.error);
      return NextResponse.json(
        { error: 'Failed to create address' },
        { status: 500 },
      );
    }

    return createSuccessResponse(result.address, 201);
  } catch (error) {
    console.error('Unexpected error in POST /api/company/addresses:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 },
    );
  }
}

async function handleGet(
  _request: NextRequest,
  auth: RouteAuthContext,
  _data: unknown,
) {
  try {
    const userId = auth.userId!;
    const companyService = getApiCompanyService();
    const addressService = getApiAddressService();
    const companyProfile = await companyService.getProfileByUserId(userId);

    if (!companyProfile) {
      return NextResponse.json(
        { error: 'Company profile not found' },
        { status: 404 },
      );
    }

    const addresses = await addressService.getAddresses(companyProfile.id);

    return createSuccessResponse(addresses);
  } catch (error) {
    console.error('Unexpected error in GET /api/company/addresses:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred' },
      { status: 500 },
    );
  }
}

export const POST = createApiHandler(
  addressCreateSchema,
  (req, auth, data) => handlePost(req, auth, data),
  { requireAuth: true }
);

export const GET = createApiHandler(
  z.object({}),
  (req, auth, data) => handleGet(req, auth, data),
  { requireAuth: true }
);

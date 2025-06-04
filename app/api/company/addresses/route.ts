import { NextRequest, NextResponse } from "next/server";
import { type RouteAuthContext } from "@/middleware/auth";
import { addressCreateSchema } from "@/core/address/models";
import { createApiHandler } from "@/lib/api/route-helpers";
import { createSuccessResponse } from "@/lib/api/common";

import { z } from "zod";
type AddressRequest = z.infer<typeof addressCreateSchema>;

async function handlePost(
  _request: NextRequest,
  auth: RouteAuthContext,
  data: AddressRequest,
  services: any
) {
  try {
    const userId = auth.userId!;
    const companyProfile = await services.addressService.getProfileByUserId(userId);
    if (!companyProfile) {
      return NextResponse.json(
        { error: 'Company profile not found' },
        { status: 404 },
      );
    }

    const result = await services.addressService.createAddress(
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
  services: any
) {
  try {
    const userId = auth.userId!;
    const companyProfile = await services.addressService.getProfileByUserId(userId);

    if (!companyProfile) {
      return NextResponse.json(
        { error: 'Company profile not found' },
        { status: 404 },
      );
    }

    const addresses = await services.addressService.getAddresses(companyProfile.id);

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
  (req, auth, data, services) => handlePost(req, auth, data, services),
  { requireAuth: true }
);

export const GET = createApiHandler(
  z.object({}),
  (req, auth, data, services) => handleGet(req, auth, data, services),
  { requireAuth: true }
);

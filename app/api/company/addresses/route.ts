import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { getApiCompanyService } from '@/services/company/factory';
import { checkRateLimit } from '@/middleware/rate-limit';
import { type RouteAuthContext } from '@/middleware/auth';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware,
} from '@/middleware/createMiddlewareChain';
import { addressCreateSchema } from '@/core/address/models';
import { createSupabaseAddressProvider } from '@/adapters/address/factory';

import { z } from 'zod';
type AddressRequest = z.infer<typeof addressCreateSchema>;

const baseMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
]);

const postMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(addressCreateSchema),
]);

async function handlePost(
  request: NextRequest,
  auth: RouteAuthContext,
  data: AddressRequest
) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;

    const companyService = getApiCompanyService();
    const companyProfile = await companyService.getProfileByUserId(userId);

    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    const addressProvider = createSupabaseAddressProvider(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const result = await addressProvider.createAddress(
      companyProfile.id,
      data
    );

    if (!result.success) {
      console.error('Error creating address:', result.error);
      return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
    }

    return NextResponse.json(result.address);

  } catch (error) {
    console.error('Unexpected error in POST /api/company/addresses:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

async function handleGet(request: NextRequest, auth: RouteAuthContext) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;

    const companyService = getApiCompanyService();
    const companyProfile = await companyService.getProfileByUserId(userId);

    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    const addressProvider = createSupabaseAddressProvider(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const addresses = await addressProvider.getAddresses(companyProfile.id);

    return NextResponse.json(addresses);

  } catch (error) {
    console.error('Unexpected error in GET /api/company/addresses:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

export const POST = postMiddleware(handlePost);
export const GET = baseMiddleware(handleGet);

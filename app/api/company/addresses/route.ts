import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { getApiCompanyService } from '@/services/company/factory';
import { checkRateLimit } from '@/middleware/rate-limit';
import { withRouteAuth, type RouteAuthContext } from '@/middleware/auth';
import { addressCreateSchema } from '@/core/address/models';
import { createSupabaseAddressProvider } from '@/adapters/address/factory';

import { z } from 'zod';
type AddressRequest = z.infer<typeof addressCreateSchema>;

async function handlePost(request: NextRequest, auth: RouteAuthContext) {
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

    // 4. Parse and Validate Request Body
    let body: AddressRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = addressCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: parseResult.error.format() 
      }, { status: 400 });
    }

    const addressProvider = createSupabaseAddressProvider(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const result = await addressProvider.createAddress(
      companyProfile.id,
      parseResult.data
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

export const POST = (req: NextRequest) => withRouteAuth(handlePost, req);
export const GET = (req: NextRequest) => withRouteAuth(handleGet, req);

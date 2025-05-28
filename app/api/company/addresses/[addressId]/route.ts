import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import { withRouteAuth, type RouteAuthContext } from '@/middleware/auth';
import { addressUpdateSchema } from '@/core/address/models';
import { createSupabaseAddressProvider } from '@/adapters/address/factory';

// Use the shared address update schema from the core layer
type AddressUpdateRequest = z.infer<typeof addressUpdateSchema>;

async function handlePut(
  request: NextRequest,
  params: { addressId: string },
  auth: RouteAuthContext
) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;

    // 3. Get Company Profile
    const { data: companyProfile, error: companyError } = await supabaseService
      .from('company_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (companyError || !companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    // 4. Parse and Validate Request Body
    let body: AddressUpdateRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = addressUpdateSchema.safeParse(body);
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

    const result = await addressProvider.updateAddress(
      companyProfile.id,
      params.addressId,
      parseResult.data
    );

    if (!result.success) {
      console.error('Error updating address:', result.error);
      return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
    }

    return NextResponse.json(result.address);

  } catch (error) {
    console.error('Unexpected error in PUT /api/company/addresses/[addressId]:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

async function handleDelete(
  request: NextRequest,
  params: { addressId: string },
  auth: RouteAuthContext
) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;

    // 3. Get Company Profile
    const { data: companyProfile, error: companyError } = await supabaseService
      .from('company_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (companyError || !companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    const addressProvider = createSupabaseAddressProvider(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const result = await addressProvider.deleteAddress(
      companyProfile.id,
      params.addressId
    );

    if (!result.success) {
      console.error('Error deleting address:', result.error);
      return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/company/addresses/[addressId]:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

export const PUT = (
  req: NextRequest,
  ctx: { params: { addressId: string } }
) => withRouteAuth((r, auth) => handlePut(r, ctx.params, auth), req);

export const DELETE = (
  req: NextRequest,
  ctx: { params: { addressId: string } }
) => withRouteAuth((r, auth) => handleDelete(r, ctx.params, auth), req);

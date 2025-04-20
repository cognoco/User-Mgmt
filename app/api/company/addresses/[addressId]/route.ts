import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';

// Address Update Schema - more permissive than creation schema
const AddressUpdateSchema = z.object({
  type: z.enum(['billing', 'shipping', 'legal']).optional(),
  street_line1: z.string().min(1).max(100).optional(),
  street_line2: z.string().max(100).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  postal_code: z.string().min(1).max(20).optional(),
  country: z.string().min(2).max(2).optional(), // ISO 2-letter country code
  is_primary: z.boolean().optional(),
  validated: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

type AddressUpdateRequest = z.infer<typeof AddressUpdateSchema>;

export async function PUT(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Authentication & Get User
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabaseService = getServiceSupabase();
    const { data: { user }, error: userError } = await supabaseService.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
    }

    // 3. Get Company Profile
    const { data: companyProfile, error: companyError } = await supabaseService
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (companyError || !companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    // 4. Get Existing Address
    const { data: existingAddress, error: addressError } = await supabaseService
      .from('company_addresses')
      .select('*')
      .eq('id', params.addressId)
      .eq('company_id', companyProfile.id)
      .single();

    if (addressError || !existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    // 5. Parse and Validate Request Body
    let body: AddressUpdateRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = AddressUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: parseResult.error.format() 
      }, { status: 400 });
    }

    // 6. If setting as primary, unset other primary addresses of same type
    if (parseResult.data.is_primary) {
      await supabaseService
        .from('company_addresses')
        .update({ is_primary: false })
        .eq('company_id', companyProfile.id)
        .eq('type', parseResult.data.type || existingAddress.type)
        .neq('id', params.addressId);
    }

    // 7. Update Address
    const updatePayload = {
      ...parseResult.data,
      updated_at: new Date().toISOString()
    };
    // Delete validated from payload if it wasn't explicitly passed in the request
    if (!('validated' in parseResult.data)) {
      delete updatePayload.validated;
    }

    const { data: updatedAddress, error: updateError } = await supabaseService
      .from('company_addresses')
      .update(updatePayload)
      .eq('id', params.addressId)
      .eq('company_id', companyProfile.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating address:', updateError);
      return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
    }

    return NextResponse.json(updatedAddress);

  } catch (error) {
    console.error('Unexpected error in PUT /api/company/addresses/[addressId]:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { addressId: string } }
) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Authentication & Get User
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabaseService = getServiceSupabase();
    const { data: { user }, error: userError } = await supabaseService.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
    }

    // 3. Get Company Profile
    const { data: companyProfile, error: companyError } = await supabaseService
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (companyError || !companyProfile) {
      return NextResponse.json({ error: 'Company profile not found' }, { status: 404 });
    }

    // 4. Delete Address
    const { error: deleteError } = await supabaseService
      .from('company_addresses')
      .delete()
      .eq('id', params.addressId)
      .eq('company_id', companyProfile.id);

    if (deleteError) {
      console.error('Error deleting address:', deleteError);
      return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/company/addresses/[addressId]:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 
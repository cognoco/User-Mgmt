import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { checkRateLimit } from '@/middleware/rate-limit';

// Address Schema
const AddressSchema = z.object({
  type: z.enum(['billing', 'shipping', 'legal']),
  street_line1: z.string().min(1).max(100),
  street_line2: z.string().max(100).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postal_code: z.string().min(1).max(20),
  country: z.string().min(2).max(2), // ISO 2-letter country code
  is_primary: z.boolean().optional().default(false),
  validated: z.boolean().optional().default(false)
});

type AddressRequest = z.infer<typeof AddressSchema>;

export async function POST(request: NextRequest) {
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

    // 4. Parse and Validate Request Body
    let body: AddressRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = AddressSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: parseResult.error.format() 
      }, { status: 400 });
    }

    // 5. If setting as primary, unset other primary addresses of same type
    if (parseResult.data.is_primary) {
      await supabaseService
        .from('company_addresses')
        .update({ is_primary: false })
        .eq('company_id', companyProfile.id)
        .eq('type', parseResult.data.type);
    }

    // 6. Create Address
    const { data: address, error: createError } = await supabaseService
      .from('company_addresses')
      .insert({
        ...parseResult.data,
        company_id: companyProfile.id,
        validated: parseResult.data.validated ?? false
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating address:', createError);
      return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
    }

    return NextResponse.json(address);

  } catch (error) {
    console.error('Unexpected error in POST /api/company/addresses:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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

    // 4. Get Addresses
    const { data: addresses, error: addressesError } = await supabaseService
      .from('company_addresses')
      .select('*')
      .eq('company_id', companyProfile.id)
      .order('created_at', { ascending: false });

    if (addressesError) {
      console.error('Error fetching addresses:', addressesError);
      return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
    }

    return NextResponse.json(addresses);

  } catch (error) {
    console.error('Unexpected error in GET /api/company/addresses:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 
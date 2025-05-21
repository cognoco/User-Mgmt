import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import { z } from 'zod';

// Validation schema for adding a new domain
const domainSchema = z.object({
  domain: z
    .string()
    .min(1, 'Domain is required')
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, 'Enter a valid domain (e.g. example.com)'),
  companyId: z.string().uuid('Invalid company ID format')
});

// GET /api/company/domains - List all domains for the current user's company
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

    // 3. Get Company Profile for the user
    const { data: companyProfile, error: profileError } = await supabaseService
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error(`Error fetching company profile for user ${user.id}:`, profileError);
      return NextResponse.json({ error: 'Failed to fetch company profile.' }, { status: 500 });
    }
    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found.' }, { status: 404 });
    }

    // 4. Get Domains for the company
    const { data: domains, error: domainsError } = await supabaseService
      .from('company_domains')
      .select('*')
      .eq('company_id', companyProfile.id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (domainsError) {
      console.error(`Error fetching domains for company ${companyProfile.id}:`, domainsError);
      return NextResponse.json({ error: 'Failed to fetch domains.' }, { status: 500 });
    }

    // 5. Return domains
    return NextResponse.json({ domains });

  } catch (error) {
    console.error('Unexpected error in GET /api/company/domains:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST /api/company/domains - Add a new domain
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

    // 3. Parse and validate request body
    const body = await request.json();
    const validationResult = domainSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    const { domain, companyId } = validationResult.data;

    // 4. Verify the user has access to the company
    const { data: companyProfile, error: profileError } = await supabaseService
      .from('company_profiles')
      .select('id')
      .eq('id', companyId)
      .eq('user_id', user.id)
      .single();

    if (profileError || !companyProfile) {
      return NextResponse.json({ error: 'You do not have permission to add domains to this company.' }, { status: 403 });
    }

    // 5. Check if domain already exists for this company
    const { data: existingDomain } = await supabaseService
      .from('company_domains')
      .select('id')
      .eq('company_id', companyId)
      .eq('domain', domain)
      .maybeSingle();

    if (existingDomain) {
      return NextResponse.json({ error: 'This domain already exists for your company.' }, { status: 400 });
    }

    // 6. Check if this is the first domain and set as primary if so
    const { data: domainCount } = await supabaseService
      .from('company_domains')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId);

    const isPrimary = (!domainCount || domainCount.length === 0);

    // 7. Insert the new domain
    const { data: newDomain, error: insertError } = await supabaseService
      .from('company_domains')
      .insert({
        company_id: companyId,
        domain,
        is_primary: isPrimary,
        is_verified: false,
        verification_method: 'dns_txt',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (insertError) {
      console.error(`Error inserting domain for company ${companyId}:`, insertError);
      return NextResponse.json({ error: 'Failed to add domain.' }, { status: 500 });
    }

    // 8. Return the new domain
    return NextResponse.json(newDomain);

  } catch (error) {
    console.error('Unexpected error in POST /api/company/domains:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 
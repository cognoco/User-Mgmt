import { type NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { checkRateLimit } from '@/middleware/rate-limit';
import { v4 as uuidv4 } from 'uuid';
import { URL } from 'url'; // Use Node.js URL parser

const VERIFICATION_PREFIX = 'user-management-verification=';

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

    // 3. Get Company Profile and Website URL
    // Assuming company_profiles is linked via user_id
    // Adjust table/column names if different
    const { data: companyProfile, error: profileError } = await supabaseService
        .from('company_profiles')
        .select('id, website')
        .eq('user_id', user.id) // Check if user_id is the correct FK
        .single();

    if (profileError) {
        console.error(`Error fetching company profile for user ${user.id}:`, profileError);
        return NextResponse.json({ error: 'Failed to fetch company profile.' }, { status: 500 });
    }
    if (!companyProfile) {
        return NextResponse.json({ error: 'Company profile not found.' }, { status: 404 });
    }
    if (!companyProfile.website) {
        return NextResponse.json({ error: 'Company website URL is not set in the profile. Cannot initiate domain verification.' }, { status: 400 });
    }

    // 4. Extract Domain Name
    let domainName: string;
    try {
        const url = new URL(companyProfile.website);
        domainName = url.hostname.replace(/^www\./, ''); // Remove www.
        if (!domainName) throw new Error('Invalid hostname');
    } catch (e) {
        console.error(`Invalid website URL format for user ${user.id}: ${companyProfile.website}`);
        return NextResponse.json({ error: 'Invalid website URL format in profile.' }, { status: 400 });
    }

    // 5. Generate Verification Token
    const verificationToken = `${VERIFICATION_PREFIX}${uuidv4()}`;

    // 6. Update Company Profile in Database
    const { error: updateError } = await supabaseService
        .from('company_profiles')
        .update({
            domain_name: domainName,
            domain_verification_token: verificationToken,
            domain_verified: false, // Reset verification status
            domain_last_checked: null, // Clear last checked time
            updated_at: new Date().toISOString(),
        })
        .eq('id', companyProfile.id); // Use the company profile ID

    if (updateError) {
        console.error(`Error updating company profile for domain verification (user ${user.id}):`, updateError);
        return NextResponse.json({ error: 'Failed to update profile with verification token.' }, { status: 500 });
    }

    // 7. Return Token and Domain to Frontend
    return NextResponse.json({
        domainName: domainName,
        verificationToken: verificationToken,
        message: "Verification initiated. Please add the provided token as a TXT record to your domain's DNS settings."
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/company/verify-domain/initiate:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 
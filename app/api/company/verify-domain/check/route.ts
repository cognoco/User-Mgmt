import { type NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import dns from 'dns/promises'; // Import Node.js DNS promises API

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

    // 3. Get Company Profile Domain Info
    // Assuming company_profiles is linked via user_id
    const { data: companyProfile, error: profileError } = await supabaseService
        .from('company_profiles')
        .select('id, domain_name, domain_verification_token')
        .eq('user_id', user.id) // Check if user_id is the correct FK
        .single();

    if (profileError) {
        console.error(`Check Domain: Error fetching company profile for user ${user.id}:`, profileError);
        return NextResponse.json({ error: 'Failed to fetch company profile.' }, { status: 500 });
    }
    if (!companyProfile) {
        return NextResponse.json({ error: 'Company profile not found.' }, { status: 404 });
    }
    if (!companyProfile.domain_name || !companyProfile.domain_verification_token) {
        return NextResponse.json({ error: 'Domain verification has not been initiated for this company.' }, { status: 400 });
    }

    const { domain_name, domain_verification_token } = companyProfile;
    let isVerified = false;
    let dnsCheckError: string | null = null;

    // 4. Perform DNS TXT Lookup
    try {
        console.log(`Checking TXT records for domain: ${domain_name}`);
        const records = await dns.resolveTxt(domain_name);
        // records is an array of arrays of strings (each inner array is one TXT record part)
        console.log(`Found TXT records for ${domain_name}:`, records);

        // Check if any record contains the verification token
        for (const recordParts of records) {
            const recordValue = recordParts.join(''); // Join parts if record is split
            if (recordValue === domain_verification_token) {
                console.log(`Verification token found for ${domain_name}`);
                isVerified = true;
                break;
            }
        }
    } catch (error: any) {        
        if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
            console.warn(`No TXT records found for domain ${domain_name}`);
            dnsCheckError = 'No TXT records found for the domain.';
            // isVerified remains false
        } else {
            console.error(`DNS lookup error for ${domain_name}:`, error);
            dnsCheckError = 'An error occurred during DNS lookup.';
            // Keep isVerified false, potentially log this for investigation
        }
    }

    // 5. Update Database
    const { error: updateError } = await supabaseService
        .from('company_profiles')
        .update({
            domain_verified: isVerified,
            domain_last_checked: new Date().toISOString(),
            // Optionally clear the token once verified?
            // domain_verification_token: isVerified ? null : domain_verification_token, 
            updated_at: new Date().toISOString(),
        })
        .eq('id', companyProfile.id);

    if (updateError) {
        console.error(`Check Domain: Error updating company profile for verification status (user ${user.id}):`, updateError);
        // Don't fail the request, but report that DB update failed
        return NextResponse.json({ 
            verified: isVerified, 
            message: isVerified ? 'Domain verified, but failed to save status.' : (dnsCheckError || 'Verification failed, and failed to save status.'),
            error: 'Database update failed.'
        }, { status: 500 }); 
    }

    // 6. Return Status
    if (isVerified) {
        return NextResponse.json({ 
            verified: true, 
            message: 'Domain successfully verified.' 
        });
    } else {
        return NextResponse.json({ 
            verified: false, 
            message: dnsCheckError || 'Verification token not found in TXT records.' 
        }, { status: 400 }); // Use 400 to indicate verification failure
    }

  } catch (error) {
    console.error('Unexpected error in POST /api/company/verify-domain/check:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 
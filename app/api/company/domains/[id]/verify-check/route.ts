import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import dns from 'dns/promises';

const supabaseService = getServiceSupabase();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : undefined;

    const {
      data: { user },
      error: userError,
    } = await supabaseService.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
    }

    const { data: domainRecord, error: domainError } = await supabaseService
      .from('company_domains')
      .select('*')
      .eq('id', params.id)
      .single();

    if (domainError || !domainRecord) {
      console.error(`Error fetching domain ${params.id}:`, domainError);
      return NextResponse.json({ error: 'Domain not found.' }, { status: 404 });
    }

    if (domainRecord.user_id && domainRecord.user_id !== user.id) {
      return NextResponse.json({ error: 'You do not have permission to verify this domain.' }, { status: 403 });
    }

    if (!domainRecord.verification_token) {
      return NextResponse.json({ error: 'Domain verification has not been initiated.' }, { status: 400 });
    }

    const { domain, verification_token } = domainRecord;
    let isVerified = false;
    let dnsCheckError: string | null = null;

    try {
      const dnsPromise = dns.resolveTxt(domain);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DNS lookup timeout')), 10000)
      );
      const records = await Promise.race([dnsPromise, timeoutPromise]);

      for (const recordParts of records as string[][]) {
        const recordValue = recordParts.join('');
        if (recordValue === verification_token) {
          isVerified = true;
          break;
        }
      }
    } catch (error: any) {
      if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
        dnsCheckError = 'No TXT records found for the domain.';
      } else if (error.message === 'DNS lookup timeout') {
        dnsCheckError = 'DNS lookup timed out. Please try again later.';
      } else {
        dnsCheckError = 'An error occurred during DNS lookup.';
      }
    }

    const { error: updateError } = await supabaseService
      .from('company_domains')
      .update({
        is_verified: isVerified,
        verification_date: isVerified ? new Date().toISOString() : null,
        last_checked: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', domainRecord.id);

    if (updateError) {
      console.error(`Error updating domain verification status for ${domain}:`, updateError);
      return NextResponse.json(
        { error: 'Failed to update domain verification status.', details: updateError.message },
        { status: 500 }
      );
    }

    if (isVerified) {
      return NextResponse.json({ verified: true, message: 'Domain successfully verified.' });
    }

    return NextResponse.json(
      { verified: false, message: dnsCheckError || 'Verification token not found in TXT records.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Unexpected error in domain verification:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

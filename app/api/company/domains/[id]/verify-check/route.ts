import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { getApiCompanyService } from '@/services/company/factory';
import { checkRateLimit } from '@/middleware/rate-limit';
import { withRouteAuth, type RouteAuthContext } from '@/middleware/auth';
import { withErrorHandling } from '@/middleware/error-handling';
import dns from 'dns/promises';

const supabaseService = getServiceSupabase();

async function handlePost(
  request: NextRequest,
  params: { id: string },
  auth: RouteAuthContext
) {
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const userId = auth.userId!;

    const { data: domainRecord, error: domainError } = await supabaseService
      .from('company_domains')
      .select('*')
      .eq('id', params.id)
      .single();

    if (domainError || !domainRecord) {
      console.error(`Error fetching domain ${params.id}:`, domainError);
      return NextResponse.json({ error: 'Domain not found.' }, { status: 404 });
    }

    const companyService = getApiCompanyService();
    const profile = await companyService.getProfileByUserId(userId);
    if (!profile || profile.id !== domainRecord.company_id) {
      return NextResponse.json(
        { error: 'You do not have permission to verify this domain.' },
        { status: 403 }
      );
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

export const POST = (
  req: NextRequest,
  ctx: { params: { id: string } }
) =>
  withErrorHandling((r) => withRouteAuth((r2, auth) => handlePost(r2, ctx.params, auth), r), req);


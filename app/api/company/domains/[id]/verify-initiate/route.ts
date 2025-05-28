import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import { withRouteAuth, type RouteAuthContext } from '@/middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const VERIFICATION_PREFIX = 'user-management-verification=';

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

    if (domainRecord.user_id && domainRecord.user_id !== userId) {
      return NextResponse.json({ error: 'You do not have permission to verify this domain.' }, { status: 403 });
    }

    const verificationToken = `${VERIFICATION_PREFIX}${uuidv4()}`;

    const { error: updateError } = await supabaseService
      .from('company_domains')
      .update({
        verification_token: verificationToken,
        is_verified: false,
        verification_date: null,
        last_checked: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', domainRecord.id);

    if (updateError) {
      console.error(`Error initiating verification for domain ${params.id}:`, updateError);
      return NextResponse.json({ error: 'Failed to update domain with verification token.' }, { status: 500 });
    }

    return NextResponse.json({
      domain: domainRecord.domain,
      verificationToken,
      message: 'Domain verification initiated. Add the token as a TXT record in your DNS.',
    });
  } catch (error) {
    console.error('Unexpected error in initiate domain verification:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

export const POST = (
  req: NextRequest,
  ctx: { params: { id: string } }
) => withRouteAuth((r, auth) => handlePost(r, ctx.params, auth), req);


import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import { v4 as uuidv4 } from 'uuid';

const VERIFICATION_PREFIX = 'user-management-verification=';

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

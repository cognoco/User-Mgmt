import { type NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { getApiConsentService } from '@/services/consent/factory';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const supabaseService = getServiceSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabaseService.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
  }

  const consentService = getApiConsentService();
  const consent = await consentService.getUserConsent(user.id);
  if (!consent) {
    return NextResponse.json({ error: 'Consent not found' }, { status: 404 });
  }
  return NextResponse.json(consent);
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const supabaseService = getServiceSupabase();
  const {
    data: { user },
    error: userError,
  } = await supabaseService.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof body.marketing !== 'boolean') {
    return NextResponse.json({ error: 'Missing marketing field' }, { status: 400 });
  }

  const consentService = getApiConsentService();
  const result = await consentService.updateUserConsent(user.id, { marketing: body.marketing });
  if (!result.success || !result.consent) {
    return NextResponse.json({ error: result.error || 'Failed to save consent' }, { status: 500 });
  }
  return NextResponse.json(result.consent);
}

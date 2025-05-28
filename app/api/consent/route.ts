import { type NextRequest, NextResponse } from 'next/server';
import { getApiConsentService } from '@/services/consent/factory';
import { withRouteAuth, type RouteAuthContext } from '@/middleware/auth';

async function handleGet(_req: NextRequest, auth: RouteAuthContext) {
  const consentService = getApiConsentService();
  const consent = await consentService.getUserConsent(auth.userId!);
  if (!consent) {
    return NextResponse.json({ error: 'Consent not found' }, { status: 404 });
  }
  return NextResponse.json(consent);
}

export const GET = (req: NextRequest) =>
  withRouteAuth((r, auth) => handleGet(r, auth), req);

async function handlePost(request: NextRequest, auth: RouteAuthContext) {

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
  const result = await consentService.updateUserConsent(auth.userId!, { marketing: body.marketing });
  if (!result.success || !result.consent) {
    return NextResponse.json({ error: result.error || 'Failed to save consent' }, { status: 500 });
  }
  return NextResponse.json(result.consent);
}

export const POST = (req: NextRequest) =>
  withRouteAuth((r, auth) => handlePost(r, auth), req);

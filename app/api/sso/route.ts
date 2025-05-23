import { NextResponse } from 'next/server';
import { triggerWebhook } from '@/lib/webhooks/triggerWebhook';
import { getApiSsoService } from '@/services/sso/factory';
import { ssoProviderSchema } from '@/core/sso/models';

// Zod schema for SSO provider config
const SsoProviderSchema = ssoProviderSchema;

// GET: List all active SSO providers for an org (orgId via query param)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const orgId = url.searchParams.get('organizationId');
  if (!orgId) {
    return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
  }
  const ssoService = getApiSsoService();
  try {
    const providers = await ssoService.getProviders(orgId);
    return NextResponse.json({ providers });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch SSO providers' },
      { status: 500 }
    );
  }
}

// POST: Upsert SSO provider config for an org
export async function POST(request: Request) {
  const body = await request.json();
  const parse = SsoProviderSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input', details: parse.error.format() }, { status: 400 });
  }
  const { organizationId, providerType, providerName, config } = parse.data;
  const ssoService = getApiSsoService();
  let provider;
  try {
    provider = await ssoService.upsertProvider({
      organizationId,
      providerType,
      providerName,
      config,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to upsert SSO provider' }, { status: 500 });
  }
  // Trigger webhook for SSO provider update
  await triggerWebhook('sso.provider.updated', {
    organizationId,
    providerType,
    providerName,
    config,
    timestamp: new Date().toISOString(),
    action: 'updated',
  });
  return NextResponse.json({ provider, success: true });
}

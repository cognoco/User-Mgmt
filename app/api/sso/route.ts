import { z } from 'zod';
import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { triggerWebhook } from '@/lib/webhooks/triggerWebhook';

// Zod schema for SSO provider config
const SsoProviderSchema = z.object({
  organizationId: z.string().uuid(),
  providerType: z.enum(['saml', 'oidc']),
  providerName: z.string().min(1),
  config: z.record(z.any()), // Accept any config fields, store as JSONB
});

// GET: List all active SSO providers for an org (orgId via query param)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const orgId = url.searchParams.get('organizationId');
  if (!orgId) {
    return NextResponse.json({ error: 'organizationId is required' }, { status: 400 });
  }
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('sso_providers')
    .select('*')
    .eq('organization_id', orgId)
    .eq('is_active', true);
  if (error) {
    return NextResponse.json({ error: 'Failed to fetch SSO providers' }, { status: 500 });
  }
  return NextResponse.json({ providers: data });
}

// POST: Upsert SSO provider config for an org
export async function POST(request: Request) {
  const body = await request.json();
  const parse = SsoProviderSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid input', details: parse.error.format() }, { status: 400 });
  }
  const { organizationId, providerType, providerName, config } = parse.data;
  const supabase = getServiceSupabase();
  // Upsert by org+type+name (one provider of each type/name per org)
  const { data, error } = await supabase
    .from('sso_providers')
    .upsert({
      organization_id: organizationId,
      provider_type: providerType,
      provider_name: providerName,
      config,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,provider_type,provider_name' })
    .select()
    .maybeSingle();
  if (error) {
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
  return NextResponse.json({ provider: data });
} 
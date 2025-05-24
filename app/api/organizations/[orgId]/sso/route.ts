import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getApiSsoService } from '@/services/sso/factory';

// Schema for SSO settings
const ssoSettingsSchema = z.object({
  sso_enabled: z.boolean(),
  idp_type: z.enum(['saml', 'oidc']).nullable(),
});


// GET /api/organizations/[orgId]/sso/settings
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const { orgId } = params;
  const path = request.nextUrl.pathname;

  const ssoService = getApiSsoService();

  // Handle status endpoint
  if (path.endsWith('/status')) {
    const providers = await ssoService.getProviders(orgId);
    if (!providers.length) {
      return NextResponse.json({
        status: 'unknown',
        lastSuccessfulLogin: null,
        lastError: null,
        totalSuccessfulLogins24h: 0,
      });
    }

    return NextResponse.json({
      status: 'healthy',
      lastSuccessfulLogin: null,
      lastError: null,
      totalSuccessfulLogins24h: 0,
    });
  }

  // Handle settings endpoint
  if (path.endsWith('/settings')) {
    const providers = await ssoService.getProviders(orgId);
    if (!providers.length) {
      return NextResponse.json({ sso_enabled: false, idp_type: null });
    }
    return NextResponse.json({
      sso_enabled: true,
      idp_type: providers[0].providerType,
    });
  }

  // Handle metadata endpoint
  if (path.endsWith('/metadata')) {
    return NextResponse.json({
      url: `https://app.example.com/organizations/${orgId}/sso/metadata.xml`,
      entity_id: `https://app.example.com/organizations/${orgId}`,
      xml: `<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     validUntil="2024-12-31T23:59:59Z"
                     entityID="https://app.example.com/organizations/${orgId}">
    <md:SPSSODescriptor AuthnRequestsSigned="true" WantAssertionsSigned="true"
                        protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:KeyDescriptor use="signing">
            <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
                <ds:X509Data>
                    <ds:X509Certificate>MIIC...</ds:X509Certificate>
                </ds:X509Data>
            </ds:KeyInfo>
        </md:KeyDescriptor>
        <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                               Location="https://app.example.com/organizations/${orgId}/sso/logout"/>
        <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                    Location="https://app.example.com/organizations/${orgId}/sso/acs"
                                    index="0" isDefault="true"/>
    </md:SPSSODescriptor>
</md:EntityDescriptor>`,
    });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

// PUT /api/organizations/[orgId]/sso/settings
export async function PUT(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  const { orgId } = params;
  const path = request.nextUrl.pathname;

  if (path.endsWith('/settings')) {
    try {
      const body = await request.json();
      const settings = ssoSettingsSchema.parse(body);
      const service = getApiSsoService();

      if (settings.sso_enabled && settings.idp_type) {
        await service.upsertProvider({
          organizationId: orgId,
          providerType: settings.idp_type,
          providerName: `default-${settings.idp_type}`,
          config: {},
        });
        return NextResponse.json(settings);
      }

      const existing = await service.getProviders(orgId);
      await Promise.all(existing.map(p => service.deleteProvider(p.id)));

      return NextResponse.json({ sso_enabled: false, idp_type: null });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
} 
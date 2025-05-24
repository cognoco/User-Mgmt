import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getApiSsoService } from '@/services/sso/factory';

// SAML Configuration Schema
const samlConfigSchema = z.object({
  entityId: z.string().min(1),
  ssoUrl: z.string().url(),
  nameIdFormat: z.string().default('urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'),
  x509Certificate: z.string().min(1),
});

// OIDC Configuration Schema
const oidcConfigSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  issuer: z.string().url(),
  authorizationEndpoint: z.string().url(),
  tokenEndpoint: z.string().url(),
  userInfoEndpoint: z.string().url(),
  scope: z.string().min(1).default('openid email profile'),
});


// GET /api/organizations/[orgId]/sso/[idpType]/config
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string; idpType: string } }
) {
  const { orgId, idpType } = params;

  if (!['saml', 'oidc'].includes(idpType)) {
    return NextResponse.json({ error: 'Invalid IDP type' }, { status: 404 });
  }

  const service = getApiSsoService();
  const providers = await service.getProviders(orgId);
  const provider = providers.find(p => p.providerType === idpType);
  const config = provider?.config;

  if (!config) {
    // Return default configuration
    const defaultConfig = idpType === 'saml' ? {
      entityId: '',
      ssoUrl: '',
      nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      x509Certificate: '',
    } : {
      clientId: '',
      clientSecret: '',
      issuer: '',
      authorizationEndpoint: '',
      tokenEndpoint: '',
      userInfoEndpoint: '',
      scope: 'openid email profile',
    };
    return NextResponse.json(defaultConfig);
  }

  return NextResponse.json(config);
}

// PUT /api/organizations/[orgId]/sso/[idpType]/config
export async function PUT(
  request: NextRequest,
  { params }: { params: { orgId: string; idpType: string } }
) {
  const { orgId, idpType } = params;

  if (!['saml', 'oidc'].includes(idpType)) {
    return NextResponse.json({ error: 'Invalid IDP type' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const schema = idpType === 'saml' ? samlConfigSchema : oidcConfigSchema;
    const config = schema.parse(body);
    
    const service = getApiSsoService();
    await service.upsertProvider({
      organizationId: orgId,
      providerType: idpType as 'saml' | 'oidc',
      providerName: idpType,
      config,
    });

    return NextResponse.json(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid configuration', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
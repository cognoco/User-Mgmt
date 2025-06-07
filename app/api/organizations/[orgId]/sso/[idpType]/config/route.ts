import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import { createSuccessResponse } from '@/lib/api/common';

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

// Combined schema that validates based on idpType
const configSchema = z.union([samlConfigSchema, oidcConfigSchema]);

// GET /api/organizations/[orgId]/sso/[idpType]/config
export const GET = createApiHandler(
  emptySchema,
  async (request: NextRequest, authContext: any, data: any, services: any) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const orgId = pathParts[3]; // /api/organizations/{orgId}/sso/{idpType}/config
    const idpType = pathParts[5];

    if (!['saml', 'oidc'].includes(idpType)) {
      return NextResponse.json({ error: 'Invalid IDP type' }, { status: 404 });
    }

    const providers = await services.sso.getProviders(orgId);
    const provider = providers.find((p: any) => p.providerType === idpType);
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
      return createSuccessResponse(defaultConfig);
    }

    return createSuccessResponse(config);
  },
  {
    requireAuth: true,
  }
);

// PUT /api/organizations/[orgId]/sso/[idpType]/config
export const PUT = createApiHandler(
  configSchema,
  async (request: NextRequest, authContext: any, body: any, services: any) => {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const orgId = pathParts[3]; // /api/organizations/{orgId}/sso/{idpType}/config
    const idpType = pathParts[5];

    if (!['saml', 'oidc'].includes(idpType)) {
      return NextResponse.json({ error: 'Invalid IDP type' }, { status: 404 });
    }

    try {
      const schema = idpType === 'saml' ? samlConfigSchema : oidcConfigSchema;
      const config = schema.parse(body);
      
      await services.sso.upsertProvider({
        organizationId: orgId,
        providerType: idpType as 'saml' | 'oidc',
        providerName: idpType,
        config,
      });

      return createSuccessResponse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid configuration', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
  }
); 
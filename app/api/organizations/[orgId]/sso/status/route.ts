import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import { createSuccessResponse } from '@/lib/api/common';

const putSchema = z.object({
  providerId: z.string(),
  active: z.boolean(),
});

// GET /api/organizations/[orgId]/sso/status
export const GET = createApiHandler(
  emptySchema,
  async (request: NextRequest, authContext: any, data: any, services: any) => {
    const url = new URL(request.url);
    const orgId = url.pathname.split('/')[3]; // Extract orgId from /api/organizations/{orgId}/sso/status
    const providers = await services.sso.getProviders(orgId);
    if (!providers.length) {
      return createSuccessResponse({
        status: 'unknown',
        lastSuccessfulLogin: null,
        lastError: null,
        totalSuccessfulLogins24h: 0,
      });
    }

    return createSuccessResponse({
      status: 'healthy',
      lastSuccessfulLogin: null,
      lastError: null,
      totalSuccessfulLogins24h: 0,
    });
  },
  {
    requireAuth: true,
  }
);

// PUT /api/organizations/[orgId]/sso/status
export const PUT = createApiHandler(
  putSchema,
  async (request: NextRequest, authContext: any, data: z.infer<typeof putSchema>, services: any) => {
    const url = new URL(request.url);
    const orgId = url.pathname.split('/')[3]; // Extract orgId from /api/organizations/{orgId}/sso/status
    
    await services.sso.setProviderActive(data.providerId, data.active);
    
    const providers = await services.sso.getProviders(orgId);
    const status = providers.length ? 'healthy' : 'unknown';
    return createSuccessResponse({
      status,
      lastSuccessfulLogin: null,
      lastError: null,
      totalSuccessfulLogins24h: 0,
    });
  },
  {
    requireAuth: true,
  }
);

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import { createSuccessResponse } from '@/lib/api/common';

const CreateOrgSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

export const GET = createApiHandler(
  emptySchema,
  async (req: NextRequest, authContext: any, data: any, services: any) => {
    const orgs = await services.organization.getUserOrganizations(authContext.userId);
    return createSuccessResponse({ organizations: orgs });
  },
  {
    requireAuth: true,
  }
);

export const POST = createApiHandler(
  CreateOrgSchema,
  async (req: NextRequest, authContext: any, data: z.infer<typeof CreateOrgSchema>, services: any) => {
    const result = await services.organization.createOrganization(authContext.userId, data);
    if (!result.success || !result.organization) {
      return NextResponse.json({ error: result.error || 'Failed to create organization' }, { status: 400 });
    }
    return NextResponse.json({ organization: result.organization }, { status: 201 });
  },
  {
    requireAuth: true,
  }
);

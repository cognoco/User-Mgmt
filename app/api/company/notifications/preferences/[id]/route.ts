import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api/routeHelpers';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  channel: z.enum(['email', 'in_app', 'both']).optional(),
});

async function handlePatch(
  _req: NextRequest,
  auth: AuthContext,
  data: z.infer<typeof updateSchema>,
  services: ServiceContainer,
  id: Promise<string>
) {
  const resolvedId = await id;
  const updated = await services.companyNotification!.updatePreference(auth.userId!, resolvedId, data);
  return NextResponse.json(updated, { status: 200 });
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const { params } = ctx;
  return createApiHandler(
    updateSchema,
    (r, a, d, s) => handlePatch(r, a, d, s, Promise.resolve(params.id)),
    { requireAuth: true }
  )(req as NextRequest);
}

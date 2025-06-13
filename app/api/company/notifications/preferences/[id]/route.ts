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
  params: Promise<{ id: string }>
) {
  const { id } = await params;
  const updated = await services.companyNotification!.updatePreference(
    auth.userId!,
    id,
    data,
  );
  return NextResponse.json(updated, { status: 200 });
}

export const PATCH = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) =>
  createApiHandler(
    updateSchema,
    (r, a, d, s) => handlePatch(r, a, d, s, ctx.params),
    { requireAuth: true },
  )(req);

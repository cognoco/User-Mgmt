import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

async function handleDelete(
  _req: NextRequest,
  auth: AuthContext,
  _data: unknown,
  services: ServiceContainer,
  params: Promise<{ id: string }>
) {
  const { id } = await params;
  await services.companyNotification!.removeRecipient(auth.userId!, id);
  return NextResponse.json(
    { success: true, message: 'Recipient removed successfully' },
    { status: 200 }
  );
}

export const DELETE = async (
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) =>
  createApiHandler(
    emptySchema,
    (r, a, d, s) => handleDelete(r, a, d, s, ctx.params),
    { requireAuth: true },
  )(req);

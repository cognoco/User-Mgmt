import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

async function handleDelete(
  _req: NextRequest,
  auth: AuthContext,
  _data: unknown,
  services: ServiceContainer,
  id: Promise<string>
) {
  const resolvedId = await id;
  await services.companyNotification!.removeRecipient(auth.userId!, resolvedId);
  return NextResponse.json(
    { success: true, message: 'Recipient removed successfully' },
    { status: 200 }
  );
}

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  const { params } = ctx;
  return createApiHandler(
    emptySchema,
    (r, a, d, s) => handleDelete(r, a, d, s, Promise.resolve(params.id)),
    { requireAuth: true }
  )(req as NextRequest);
}

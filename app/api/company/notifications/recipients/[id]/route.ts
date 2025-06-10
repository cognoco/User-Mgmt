import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

async function handleDelete(_req: Request, auth: AuthContext, _data: unknown, services: ServiceContainer, id: Promise<string>) {
  const resolvedId = await id;
  await services.companyNotification!.removeRecipient(auth.userId!, resolvedId);
  return new Response(
    JSON.stringify({ success: true, message: 'Recipient removed successfully' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

export const DELETE = async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const params = await ctx.params;
  return createApiHandler(emptySchema, (r, a, d, s) => handleDelete(r, a, d, s, Promise.resolve(params.id)), { requireAuth: true })(req);
};

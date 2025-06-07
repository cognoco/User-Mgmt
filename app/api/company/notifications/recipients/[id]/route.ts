import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

async function handleDelete(_req: Request, auth: AuthContext, _data: unknown, services: ServiceContainer, id: string) {
  await services.companyNotification!.removeRecipient(auth.userId!, id);
  return new Response(
    JSON.stringify({ success: true, message: 'Recipient removed successfully' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
}

export const DELETE = (req: Request, ctx: { params: { id: string } }) =>
  createApiHandler(emptySchema, (r, a, d, s) => handleDelete(r, a, d, s, ctx.params.id), { requireAuth: true })(req);

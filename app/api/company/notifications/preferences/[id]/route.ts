import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  channel: z.enum(['email', 'in_app', 'both']).optional(),
});

async function handlePatch(_req: Request, auth: AuthContext, data: z.infer<typeof updateSchema>, services: ServiceContainer, id: Promise<string>) {
  const resolvedId = await id;
  const updated = await services.companyNotification!.updatePreference(auth.userId!, resolvedId, data);
  return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export const PATCH = async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const params = await ctx.params;
  return createApiHandler(updateSchema, (r, a, d, s) => handlePatch(r, a, d, s, Promise.resolve(params.id)), { requireAuth: true })(req);
};

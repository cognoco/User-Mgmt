import { z } from 'zod';
import { createApiHandler } from '@/lib/api/route-helpers';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  channel: z.enum(['email', 'in_app', 'both']).optional(),
});

async function handlePatch(_req: Request, auth: AuthContext, data: z.infer<typeof updateSchema>, services: ServiceContainer, id: string) {
  const updated = await services.companyNotification!.updatePreference(auth.userId!, id, data);
  return new Response(JSON.stringify(updated), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

export const PATCH = (req: Request, ctx: { params: { id: string } }) =>
  createApiHandler(updateSchema, (r, a, d, s) => handlePatch(r, a, d, s, ctx.params.id), { requireAuth: true })(req);

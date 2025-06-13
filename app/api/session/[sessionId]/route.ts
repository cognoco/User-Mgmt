import { type NextRequest } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import { createSuccessResponse, createServerError } from '@/lib/api/common';
import { getApiSessionService } from '@/services/session/factory';

async function handleDelete(
  _req: NextRequest,
  ctx: any,
  _data: unknown,
  params: { sessionId: string },
) {
  const service = getApiSessionService();
  const result = await service!.revokeUserSession(ctx.userId!, params.sessionId);
  if (!result.success) {
    throw createServerError(result.error || 'Failed to revoke session');
  }
  return createSuccessResponse({ success: true });
}

// DELETE /api/session/:sessionId - Revoke a specific session for the current user
export const DELETE = (
  req: NextRequest,
  ctx: { params: { sessionId: string } },
) =>
  createApiHandler(
    emptySchema,
    (r, auth, data) => handleDelete(r, auth, data, ctx.params),
    { requireAuth: true },
  )(req);

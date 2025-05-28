import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getApiTeamService } from '@/services/team/factory';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware
} from '@/middleware/createMiddlewareChain';
import type { RouteAuthContext } from '@/middleware/auth';

const UpdateTeamSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional()
});

async function handleGet(
  _req: NextRequest,
  _auth: RouteAuthContext,
  _data: unknown,
  { params }: { params: { teamId: string } }
) {
  const service = getApiTeamService();
  const team = await service.getTeam(params.teamId);
  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }
  return NextResponse.json({ team });
}

async function handlePatch(
  _req: NextRequest,
  _auth: RouteAuthContext,
  data: z.infer<typeof UpdateTeamSchema>,
  { params }: { params: { teamId: string } }
) {
  const result = await getApiTeamService().updateTeam(params.teamId, data);
  if (!result.success || !result.team) {
    return NextResponse.json({ error: result.error || 'Failed to update team' }, { status: 400 });
  }
  return NextResponse.json({ team: result.team });
}

async function handleDelete(
  _req: NextRequest,
  _auth: RouteAuthContext,
  _data: unknown,
  { params }: { params: { teamId: string } }
) {
  const result = await getApiTeamService().deleteTeam(params.teamId);
  if (!result.success) {
    return NextResponse.json({ error: result.error || 'Failed to delete team' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}

const baseMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware()
]);

const patchMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(UpdateTeamSchema)
]);

export const GET = (req: NextRequest, ctx: { params: { teamId: string } }) =>
  baseMiddleware((r, auth) => handleGet(r, auth, undefined, ctx))(req);

export const PATCH = (req: NextRequest, ctx: { params: { teamId: string } }) =>
  patchMiddleware((r, auth, data) => handlePatch(r, auth, data, ctx))(req);

export const DELETE = (req: NextRequest, ctx: { params: { teamId: string } }) =>
  baseMiddleware((r, auth) => handleDelete(r, auth, undefined, ctx))(req);

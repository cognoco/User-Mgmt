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

const CreateTeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

async function handleGet(_req: NextRequest, auth: RouteAuthContext) {
  const service = getApiTeamService();
  const teams = await service.getUserTeams(auth.userId!);
  return NextResponse.json({ teams });
}

async function handlePost(
  _req: NextRequest,
  auth: RouteAuthContext,
  data: z.infer<typeof CreateTeamSchema>
) {
  const result = await getApiTeamService().createTeam(auth.userId!, data);
  if (!result.success || !result.team) {
    return NextResponse.json({ error: result.error || 'Failed to create team' }, { status: 400 });
  }
  return NextResponse.json({ team: result.team }, { status: 201 });
}

const getMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware()
]);

const postMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(CreateTeamSchema)
]);

export const GET = getMiddleware(handleGet);
export const POST = postMiddleware(handlePost);

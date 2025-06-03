import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/route-helpers';
import {
  createSuccessResponse,
  createNoContentResponse,
} from '@/lib/api/common';
import {
  mapTeamServiceError,
  createTeamNotFoundError,
} from '@/lib/api/team/error-handler';

const UpdateTeamSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const GET = (
  req: NextRequest,
  { params }: { params: { teamId: string } }
) =>
  createApiHandler(
    z.object({}),
    async (_r, _c, _d, services) => {
      const team = await services.team.getTeam(params.teamId);
      if (!team) {
        throw createTeamNotFoundError(params.teamId);
      }
      return createSuccessResponse({ team });
    },
    { requireAuth: true }
  )(req);

export const PATCH = (
  req: NextRequest,
  { params }: { params: { teamId: string } }
) =>
  createApiHandler(
    UpdateTeamSchema,
    async (_r, _c, data, services) => {
      const result = await services.team.updateTeam(params.teamId, data);
      if (!result.success || !result.team) {
        throw mapTeamServiceError(new Error(result.error || 'Failed to update team'));
      }
      return createSuccessResponse(result.team);
    },
    { requireAuth: true }
  )(req);

export const DELETE = (
  req: NextRequest,
  { params }: { params: { teamId: string } }
) =>
  createApiHandler(
    z.object({}),
    async (_r, _c, _d, services) => {
      const result = await services.team.deleteTeam(params.teamId);
      if (!result.success) {
        throw mapTeamServiceError(new Error(result.error || 'Failed to delete team'));
      }
      return createNoContentResponse();
    },
    { requireAuth: true }
  )(req);

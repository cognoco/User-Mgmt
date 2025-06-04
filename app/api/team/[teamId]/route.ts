import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';

const UpdateTeamSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export const GET = (req: NextRequest, ctx: { params: { teamId: string } }) =>
  createApiHandler(
    emptySchema,
    async (_request, { userId }, _data, services) => {
      if (!services.team) {
        throw new ApiError(ERROR_CODES.NOT_IMPLEMENTED, 'Team service not available');
      }
      const team = await services.team.getTeam(ctx.params.teamId);
      if (!team) {
        throw new ApiError(ERROR_CODES.NOT_FOUND, 'Team not found', 404);
      }
      return createSuccessResponse({ team });
    },
    { requireAuth: true }
  )(req as any);

export const PATCH = (req: NextRequest, ctx: { params: { teamId: string } }) =>
  createApiHandler(
    UpdateTeamSchema,
    async (_request, { userId }, data, services) => {
      if (!services.team) {
        throw new ApiError(ERROR_CODES.NOT_IMPLEMENTED, 'Team service not available');
      }
      const result = await services.team.updateTeam(ctx.params.teamId, data);
      if (!result.success || !result.team) {
        throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'Failed to update team', 400);
      }
      return createSuccessResponse({ team: result.team });
    },
    { requireAuth: true }
  )(req as any);

export const DELETE = (req: NextRequest, ctx: { params: { teamId: string } }) =>
  createApiHandler(
    emptySchema,
    async (_request, { userId }, _data, services) => {
      if (!services.team) {
        throw new ApiError(ERROR_CODES.NOT_IMPLEMENTED, 'Team service not available');
      }
      const result = await services.team.deleteTeam(ctx.params.teamId);
      if (!result.success) {
        throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'Failed to delete team', 400);
      }
      return createSuccessResponse({ success: true });
    },
    { requireAuth: true }
  )(req as any);

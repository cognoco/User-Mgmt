import { z } from 'zod';
import { createApiHandler, emptySchema } from '@/lib/api/route-helpers';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';

const CreateTeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

export const GET = createApiHandler(
  emptySchema,
  async (_req, { userId }, _data, services) => {
    if (!services.team) {
      throw new ApiError(ERROR_CODES.NOT_IMPLEMENTED, 'Team service not available');
    }
    const teams = await services.team.getUserTeams(userId!);
    return createSuccessResponse({ teams });
  },
  { requireAuth: true }
);

export const POST = createApiHandler(
  CreateTeamSchema,
  async (_req, { userId }, data, services) => {
    if (!services.team) {
      throw new ApiError(ERROR_CODES.NOT_IMPLEMENTED, 'Team service not available');
    }
    const result = await services.team.createTeam(userId!, data);
    if (!result.success || !result.team) {
      throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'Failed to create team', 400);
    }
    return createSuccessResponse(result.team, 201);
  },
  { requireAuth: true }
);

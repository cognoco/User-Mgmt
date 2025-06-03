import { z } from 'zod';
import { createApiHandler } from '@/lib/api/route-helpers';
import { createSuccessResponse, createCreatedResponse } from '@/lib/api/common';
import { mapTeamServiceError } from '@/lib/api/team/error-handler';

const CreateTeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

export const GET = createApiHandler(
  z.object({}),
  async (_req, { userId }, _data, services) => {
    const teams = await services.team.getUserTeams(userId!);
    return createSuccessResponse({ teams });
  },
  { requireAuth: true }
);

export const POST = createApiHandler(
  CreateTeamSchema,
  async (_req, { userId }, data, services) => {
    const result = await services.team.createTeam(userId!, data);
    if (!result.success || !result.team) {
      throw mapTeamServiceError(new Error(result.error || 'Failed to create team'));
    }
    return createCreatedResponse(result.team);
  },
  { requireAuth: true }
);

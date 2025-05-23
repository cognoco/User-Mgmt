import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiTeamService } from '@/services/team/factory';
import { ApiError } from '@/lib/api/common';
import { z } from 'zod';

const idSchema = z.string().uuid('Invalid team id');

/**
 * GET /api/team/[id]
 */
const getTeamHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const [id] = (req.query.team as string[]) || [];
    const parse = idSchema.safeParse(id);
    if (!parse.success) {
      throw new ApiError(400, 'Invalid team id');
    }
    const teamService = getApiTeamService();
    const team = await teamService.getTeam(parse.data);
    if (!team) throw new ApiError(404, 'Team not found');
    return team;
  }
});

export default function handler(req: any, res: any) {
  return getTeamHandler(req, res);
}

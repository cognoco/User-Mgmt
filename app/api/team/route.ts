import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getApiTeamService } from '@/services/team/factory';
import { withErrorHandling } from '@/middleware/error-handling';

const CreateTeamSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

async function handleGet(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const service = getApiTeamService();
  const teams = await service.getUserTeams(userId);
  return NextResponse.json({ teams });
}

async function handlePost(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const parsed = CreateTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const result = await getApiTeamService().createTeam(userId, parsed.data);
  if (!result.success || !result.team) {
    return NextResponse.json({ error: result.error || 'Failed to create team' }, { status: 400 });
  }
  return NextResponse.json({ team: result.team }, { status: 201 });
}

export const GET = (req: NextRequest) => withErrorHandling(handleGet, req);
export const POST = (req: NextRequest) => withErrorHandling(handlePost, req);

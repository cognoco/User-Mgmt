import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getApiTeamService } from '@/services/team/factory';
import { withErrorHandling } from '@/middleware/error-handling';

const UpdateTeamSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional()
});

async function handleGet(req: NextRequest, { params }: { params: { teamId: string } }) {
  const service = getApiTeamService();
  const team = await service.getTeam(params.teamId);
  if (!team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
  }
  return NextResponse.json({ team });
}

async function handlePatch(req: NextRequest, { params }: { params: { teamId: string } }) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const parsed = UpdateTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const result = await getApiTeamService().updateTeam(params.teamId, parsed.data);
  if (!result.success || !result.team) {
    return NextResponse.json({ error: result.error || 'Failed to update team' }, { status: 400 });
  }
  return NextResponse.json({ team: result.team });
}

async function handleDelete(req: NextRequest, { params }: { params: { teamId: string } }) {
  const result = await getApiTeamService().deleteTeam(params.teamId);
  if (!result.success) {
    return NextResponse.json({ error: result.error || 'Failed to delete team' }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}

export const GET = (req: NextRequest, ctx: { params: { teamId: string } }) => withErrorHandling((r) => handleGet(r, ctx), req);
export const PATCH = (req: NextRequest, ctx: { params: { teamId: string } }) => withErrorHandling((r) => handlePatch(r, ctx), req);
export const DELETE = (req: NextRequest, ctx: { params: { teamId: string } }) => withErrorHandling((r) => handleDelete(r, ctx), req);

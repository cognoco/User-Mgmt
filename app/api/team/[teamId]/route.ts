import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import {
  createSuccessResponse,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';
import {
  createTeamNotFoundError
} from '@/lib/api/team/errorHandler';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

const UpdateTeamSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional()
});

const ParamSchema = z.object({ teamId: z.string().min(1, 'Invalid team id') });

async function handleGet(
  _req: NextRequest,
  _auth: AuthContext,
  _data: unknown,
  services: ServiceContainer,
  teamId: string
) {
  const team = await services.team.getTeam(teamId);
  if (!team) {
    throw createTeamNotFoundError(teamId);
  }
  return createSuccessResponse({ team });
}

async function handlePatch(
  _req: NextRequest,
  _auth: AuthContext,
  data: z.infer<typeof UpdateTeamSchema>,
  services: ServiceContainer,
  teamId: string
) {
  const result = await services.team.updateTeam(teamId, data);
  if (!result.success || !result.team) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'Failed to update team', 400);
  }
  return createSuccessResponse({ team: result.team });
}

async function handleDelete(
  _req: NextRequest,
  _auth: AuthContext,
  _data: unknown,
  services: ServiceContainer,
  teamId: string
) {
  const result = await services.team.deleteTeam(teamId);
  if (!result.success) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'Failed to delete team', 400);
  }
  return createSuccessResponse({ success: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const resolvedParams = await params;
  const parsed = ParamSchema.safeParse(resolvedParams);
  if (!parsed.success) {
    return NextResponse.json(
      new ApiError(ERROR_CODES.INVALID_REQUEST, parsed.error.message, 400).toResponse(),
      { status: 400 }
    );
  }
  return createApiHandler(emptySchema, (r, a, d, s) => handleGet(r, a, d, s, parsed.data.teamId), { requireAuth: true })(req);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const resolvedParams = await params;
  const parsed = ParamSchema.safeParse(resolvedParams);
  if (!parsed.success) {
    return NextResponse.json(
      new ApiError(ERROR_CODES.INVALID_REQUEST, parsed.error.message, 400).toResponse(),
      { status: 400 }
    );
  }
  return createApiHandler(UpdateTeamSchema, (r, a, d, s) => handlePatch(r, a, d, s, parsed.data.teamId), { requireAuth: true })(req);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const resolvedParams = await params;
  const parsed = ParamSchema.safeParse(resolvedParams);
  if (!parsed.success) {
    return NextResponse.json(
      new ApiError(ERROR_CODES.INVALID_REQUEST, parsed.error.message, 400).toResponse(),
      { status: 400 }
    );
  }
  return createApiHandler(emptySchema, (r, a, d, s) => handleDelete(r, a, d, s, parsed.data.teamId), { requireAuth: true })(req);
}

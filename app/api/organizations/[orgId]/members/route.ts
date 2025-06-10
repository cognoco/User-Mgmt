import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';

const AddMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.string().min(1)
});

const ParamSchema = z.object({ orgId: z.string().min(1) });

async function handleGet(
  _req: NextRequest,
  _auth: any,
  _data: unknown,
  services: any,
  orgId: Promise<string>
) {
  const resolvedOrgId = await orgId;
  const members = await services.organization.getOrganizationMembers(resolvedOrgId);
  return createSuccessResponse({ members });
}

async function handlePost(
  _req: NextRequest,
  _auth: any,
  data: z.infer<typeof AddMemberSchema>,
  services: any,
  orgId: Promise<string>
) {
  const resolvedOrgId = await orgId;
  const result = await services.organization.addOrganizationMember(resolvedOrgId, data.userId, data.role);
  if (!result.success || !result.member) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, result.error || 'Failed to add member', 400);
  }
  return createSuccessResponse({ member: result.member }, 201);
}

export const GET = async (req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) => {
  const params = await ctx.params;
  const parsed = ParamSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      new ApiError(ERROR_CODES.INVALID_REQUEST, parsed.error.message, 400).toResponse(),
      { status: 400 }
    );
  }
  return createApiHandler(emptySchema, (r, a, d, s) => handleGet(r, a, d, s, Promise.resolve(parsed.data.orgId)), { requireAuth: true })(req);
};

export const POST = async (req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) => {
  const params = await ctx.params;
  const parsed = ParamSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      new ApiError(ERROR_CODES.INVALID_REQUEST, parsed.error.message, 400).toResponse(),
      { status: 400 }
    );
  }
  return createApiHandler(AddMemberSchema, (r, a, d, s) => handlePost(r, a, d, s, Promise.resolve(parsed.data.orgId)), { requireAuth: true })(req);
};

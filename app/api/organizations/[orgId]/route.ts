import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';

const UpdateOrgSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
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
  const org = await services.organization.getOrganization(resolvedOrgId);
  if (!org) {
    throw new ApiError(ERROR_CODES.NOT_FOUND, 'Organization not found', 404);
  }
  return createSuccessResponse({ organization: org });
}

async function handlePut(
  _req: NextRequest,
  _auth: any,
  data: z.infer<typeof UpdateOrgSchema>,
  services: any,
  orgId: Promise<string>
) {
  const resolvedOrgId = await orgId;
  const result = await services.organization.updateOrganization(resolvedOrgId, data);
  if (!result.success || !result.organization) {
    throw new ApiError(
      ERROR_CODES.INVALID_REQUEST,
      result.error || 'Failed to update organization',
      400
    );
  }
  return createSuccessResponse({ organization: result.organization });
}

async function handleDelete(
  _req: NextRequest,
  _auth: any,
  _data: unknown,
  services: any,
  orgId: Promise<string>
) {
  const resolvedOrgId = await orgId;
  const result = await services.organization.deleteOrganization(resolvedOrgId);
  if (!result.success) {
    throw new ApiError(
      ERROR_CODES.INVALID_REQUEST,
      result.error || 'Failed to delete organization',
      400
    );
  }
  return createSuccessResponse({ success: true });
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

export const PUT = async (req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) => {
  const params = await ctx.params;
  const parsed = ParamSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      new ApiError(ERROR_CODES.INVALID_REQUEST, parsed.error.message, 400).toResponse(),
      { status: 400 }
    );
  }
  return createApiHandler(UpdateOrgSchema, (r, a, d, s) => handlePut(r, a, d, s, Promise.resolve(parsed.data.orgId)), { requireAuth: true })(req);
};

export const DELETE = async (req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) => {
  const params = await ctx.params;
  const parsed = ParamSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      new ApiError(ERROR_CODES.INVALID_REQUEST, parsed.error.message, 400).toResponse(),
      { status: 400 }
    );
  }
  return createApiHandler(emptySchema, (r, a, d, s) => handleDelete(r, a, d, s, Promise.resolve(parsed.data.orgId)), { requireAuth: true })(req);
};

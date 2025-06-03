import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createCreatedResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import { getApiPermissionService } from '@/services/permission/factory';
import { mapPermissionServiceError } from '@/lib/api/permission/error-handler';
import { PermissionValues } from '@/core/permission/models';

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

type CreateRole = z.infer<typeof createSchema>;

async function handleGet(req: NextRequest) {
  const service = getApiPermissionService();
  const roles = await service.getAllRoles();
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const start = (page - 1) * limit;
  const paginated = roles.slice(start, start + limit);
  return createSuccessResponse({ roles: paginated, page, limit, total: roles.length });
}

async function handlePost(_req: NextRequest, userId: string | undefined, data: CreateRole) {
  const service = getApiPermissionService();
  try {
    const role = await service.createRole(data, userId);
    return createCreatedResponse({ role });
  } catch (e) {
    throw mapPermissionServiceError(e as Error);
  }
}

export const GET = createProtectedHandler(
  (req) => withErrorHandling((r) => handleGet(r), req),
  PermissionValues.MANAGE_ROLES
);

export const POST = createProtectedHandler(
  (req, ctx) =>
    withSecurity(async (r) => {
      const body = await r.json();
      return withErrorHandling(
        (r3) => withValidation(createSchema, (r2, data) => handlePost(r2, ctx.userId, data), r3, body),
        r
      );
    })(req),
  PermissionValues.MANAGE_ROLES
);

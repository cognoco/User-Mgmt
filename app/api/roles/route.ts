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

async function handleGet() {
  const service = getApiPermissionService();
  const roles = await service.getAllRoles();
  return createSuccessResponse({ roles });
}

async function handlePost(_req: NextRequest, data: CreateRole) {
  const service = getApiPermissionService();
  try {
    const role = await service.createRole(data);
    return createCreatedResponse({ role });
  } catch (e) {
    throw mapPermissionServiceError(e as Error);
  }
}

export const GET = createProtectedHandler(
  (req) => withErrorHandling(() => handleGet(), req),
  PermissionValues.MANAGE_ROLES
);

export const POST = createProtectedHandler(
  (req) =>
    withSecurity(async (r) => {
      const body = await r.json();
      return withErrorHandling(
        (r3) => withValidation(createSchema, (r2, data) => handlePost(r2, data), r3, body),
        r
      );
    })(req),
  PermissionValues.MANAGE_ROLES
);

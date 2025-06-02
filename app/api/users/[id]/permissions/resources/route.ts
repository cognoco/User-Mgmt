import { type NextRequest } from 'next/server';
import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { createProtectedHandler } from '@/middleware/permissions';
import { PermissionValues } from '@/core/permission/models';

// GET /api/users/[id]/permissions/resources - Get resource permissions for a user

async function handleGet() {
  // TODO: Implement resource permission retrieval
  return createSuccessResponse({ permissions: [] });
}

export const GET = createProtectedHandler(
  (req) => withErrorHandling(() => handleGet(), req),
  PermissionValues.MANAGE_ROLES,
);

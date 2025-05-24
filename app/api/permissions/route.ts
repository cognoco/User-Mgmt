import { type NextRequest } from 'next/server';
import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { getApiPermissionService } from '@/services/permission/factory';

async function handleGet() {
  const permissionService = getApiPermissionService();
  const permissions = await permissionService.getAllPermissions();
  return createSuccessResponse({ permissions });
}

export async function GET(req: NextRequest) {
  return withErrorHandling(() => handleGet(), req);
}

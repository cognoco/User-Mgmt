import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { createSuccessResponse } from '@/lib/api/common';
import { permissionCheckCache } from '@/lib/auth/permissionCache';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

const CheckPermissionSchema = z.object({
  permission: z.string().min(1),
  resourceType: z.string().optional(),
  resourceId: z.string().optional()
});

async function handleCheckPermission(
  _req: NextRequest,
  auth: AuthContext,
  data: z.infer<typeof CheckPermissionSchema>,
  services: ServiceContainer,
) {
  if (!auth.userId) {
    return createSuccessResponse({ hasPermission: false });
  }

  const key = `${auth.userId}:${data.permission}:${data.resourceType ?? ''}:${
    data.resourceId ?? ''}`;

  const allowed = await permissionCheckCache.getOrCreate(key, () =>
    services.permission!.hasPermission(auth.userId!, data.permission as any)
  );

  return createSuccessResponse({ hasPermission: allowed });
}

export const POST = createApiHandler(
  CheckPermissionSchema,
  handleCheckPermission,
  { requireAuth: true },
);

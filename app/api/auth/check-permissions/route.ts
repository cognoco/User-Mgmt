import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { createSuccessResponse } from '@/lib/api/common';
import { permissionCheckCache } from '@/lib/auth/permissionCache';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

const CheckSchema = z.object({
  permission: z.string().min(1),
  resourceType: z.string().optional(),
  resourceId: z.string().optional()
});

const BatchSchema = z.object({
  checks: z.array(CheckSchema).min(1)
});

async function handleCheckPermissions(
  _req: NextRequest,
  auth: AuthContext,
  data: z.infer<typeof BatchSchema>,
  services: ServiceContainer,
) {
  if (!auth.userId) {
    return createSuccessResponse({
      results: data.checks.map((c) => ({ permission: c.permission, hasPermission: false })),
    });
  }

  const results = await Promise.all(
    data.checks.map(async (c) => {
      const key = `${auth.userId}:${c.permission}:${c.resourceType ?? ''}:${c.resourceId ?? ''}`;
      const allowed = await permissionCheckCache.getOrCreate(key, () =>
        services.permission!.hasPermission(auth.userId!, c.permission as any)
      );
      return { permission: c.permission, hasPermission: allowed };
    })
  );

  return createSuccessResponse({ results });
}

export const POST = createApiHandler(
  BatchSchema,
  handleCheckPermissions,
  { requireAuth: true },
);

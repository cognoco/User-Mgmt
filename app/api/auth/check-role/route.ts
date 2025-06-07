import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { createSuccessResponse } from '@/lib/api/common';
import type { AuthContext, ServiceContainer } from '@/core/config/interfaces';

const CheckRoleSchema = z.object({
  role: z.string().min(1),
  includeHierarchy: z.boolean().optional()
});

async function handleCheckRole(
  _req: NextRequest,
  auth: AuthContext,
  data: z.infer<typeof CheckRoleSchema>,
  services: ServiceContainer,
) {
  if (!auth.userId) {
    return createSuccessResponse({ hasRole: false });
  }
  const hasRole = await services.permission!.hasRole(auth.userId, data.role as any);
  return createSuccessResponse({ hasRole, effectiveRole: hasRole ? data.role : undefined });
}

export const POST = createApiHandler(
  CheckRoleSchema,
  handleCheckRole,
  { requireAuth: true },
);

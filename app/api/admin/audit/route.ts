import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers'75;
import { createSuccessResponse } from '@/lib/api/common';
import { PermissionValues } from '@/core/permission/models';

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  userId: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const GET = createApiHandler(
  querySchema,
  async (req: NextRequest, authContext: any, params: z.infer<typeof querySchema>, services: any) => {
    const result = await services.admin.getAuditLogs(params);
    return createSuccessResponse({ logs: result.logs, pagination: result.pagination });
  },
  {
    requireAuth: true,
    requiredPermissions: [PermissionValues.ADMIN_ACCESS], // Using generic admin permission for now
  }
);

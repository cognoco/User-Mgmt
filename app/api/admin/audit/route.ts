import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { createSuccessResponse } from '@/lib/api/common';
import { PermissionValues } from '@/core/permission/models';

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const GET = createApiHandler(
  querySchema,
  async (req: NextRequest, authContext: any, params: z.infer<typeof querySchema>, services: any) => {
    // Apply defaults for undefined values
    const auditParams = {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      sortOrder: params.sortOrder ?? 'desc',
      ...params
    };
    
    const result = await services.admin.getAuditLogs(auditParams);
    return createSuccessResponse({ logs: result.logs, pagination: result.pagination });
  },
  {
    requireAuth: true,
    requiredPermissions: [PermissionValues.ADMIN_ACCESS], // Using generic admin permission for now
  }
);

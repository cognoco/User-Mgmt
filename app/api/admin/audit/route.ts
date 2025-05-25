import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { getApiAdminService } from '@/services/admin/factory';
import { createProtectedHandler } from '@/middleware/permissions';

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

type Query = z.infer<typeof querySchema>;

async function handleAuditLogs(req: NextRequest, params: Query) {
  const adminService = getApiAdminService();
  const result = await adminService.getAuditLogs(params);
  return createSuccessResponse({ logs: result.logs, pagination: result.pagination });
}

async function handler(req: NextRequest) {
  return withErrorHandling(
    async (r) => {
      const url = new URL(r.url);
      const query = Object.fromEntries(url.searchParams.entries());
      return withValidation(querySchema, handleAuditLogs, r, query as any);
    },
    req
  );
}

export const GET = createProtectedHandler(handler, 'admin.audit.view');

import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { getApiAdminService } from '@/services/admin/factory';
import { createUserNotFoundError, mapAdminServiceError } from '@/lib/api/admin/error-handler';
import { createProtectedHandler } from '@/middleware/permissions';

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

type QueryParams = z.infer<typeof querySchema>;

async function handleAdminUsers(req: NextRequest, params: QueryParams) {
  const adminService = getApiAdminService();
  const result = await adminService.listUsers(params);

  return createSuccessResponse({
    users: result.users,
    pagination: result.pagination,
  });
}

async function handler(req: NextRequest) {
  return withErrorHandling(
    async (r) => {
      const url = new URL(r.url);
      const query = Object.fromEntries(url.searchParams.entries());
      return withValidation(querySchema, handleAdminUsers, r, query as any);
    },
    req
  );
}

export const GET = createProtectedHandler(handler, 'admin.users.list');

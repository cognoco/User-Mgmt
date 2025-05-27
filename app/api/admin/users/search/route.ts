import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createProtectedHandler } from '@/middleware/permissions';
import { getApiAdminService } from '@/services/admin/factory';

const searchSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(['active', 'inactive', 'suspended', 'all']).optional().default('all'),
  role: z.string().optional(),
  dateCreatedStart: z.string().optional(),
  dateCreatedEnd: z.string().optional(),
  dateLastLoginStart: z.string().optional(),
  dateLastLoginEnd: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'lastLoginAt', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  teamId: z.string().optional(),
});

export type SearchQuery = z.infer<typeof searchSchema>;

async function handleSearchUsers(_req: NextRequest, params: SearchQuery) {
  const adminService = getApiAdminService();
  const result = await adminService.searchUsers(params);
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
      return withValidation(searchSchema, handleSearchUsers, r, query as any);
    },
    req
  );
}

export const GET = createProtectedHandler(handler, 'admin.users.list');

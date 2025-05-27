import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createProtectedHandler } from '@/middleware/permissions';
import { getApiAdminService } from '@/services/admin/factory';
import { logUserAction } from '@/lib/audit/auditLogger';

const exportSchema = z.object({
  format: z.enum(['csv', 'json']).default('csv'),
  query: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'all']).optional(),
  role: z.string().optional(),
  dateCreatedStart: z.string().optional(),
  dateCreatedEnd: z.string().optional(),
  dateLastLoginStart: z.string().optional(),
  dateLastLoginEnd: z.string().optional(),
  teamId: z.string().optional(),
});

async function handleExportUsers(req: NextRequest, params: z.infer<typeof exportSchema>) {
  const { format, ...searchParams } = params;
  const adminService = getApiAdminService();
  const result = await adminService.searchUsers({ ...searchParams, limit: 10000, page: 1 });
  await logUserAction({
    action: 'USERS_EXPORT',
    status: 'SUCCESS',
    targetResourceType: 'user',
    details: {
      format,
      userCount: result.users.length,
      searchParams,
    },
  });
  if (format === 'json') {
    return new Response(JSON.stringify(result.users, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } else {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Status', 'Role', 'Created At', 'Last Login At'];
    const rows = result.users.map((u) => [u.id, u.firstName, u.lastName, u.email, u.status, u.role, u.createdAt, u.lastLoginAt || '']);
    const csv = [headers.join(','), ...rows.map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }
}

async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const query = Object.fromEntries(url.searchParams.entries());
  return withValidation(exportSchema, handleExportUsers, req, query as any);
}

export const GET = createProtectedHandler((req) => withErrorHandling(() => handler(req), req), 'admin.users.export');

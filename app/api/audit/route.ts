import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/auth/hasPermission';
import { getApiAuditService } from '@/services/audit/factory';

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  status: z.enum(['SUCCESS', 'FAILURE', 'INITIATED', 'COMPLETED']).optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['created_at', 'action', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const result = querySchema.safeParse({
      ...queryParams,
      page: queryParams.page ? parseInt(queryParams.page) : undefined,
      limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: result.error.errors },
        { status: 400 }
      );
    }

    const {
      userId,
      page,
      limit,
      startDate,
      endDate,
      action,
      status,
      resourceType,
      resourceId,
      sortOrder,
    } = result.data;
    const targetUserId = userId ?? user.id;

    if (userId && userId !== user.id) {
      const allowed = await hasPermission(user.id, 'VIEW_ALL_USER_ACTION_LOGS');
      if (!allowed) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const service = getApiAuditService();
    const { logs, count } = await service.getLogs({
      page,
      limit,
      userId: targetUserId,
      startDate,
      endDate,
      action,
      status,
      resourceType,
      resourceId,
      ipAddress: result.data.ipAddress,
      userAgent: result.data.userAgent,
      search: result.data.search,
      sortBy: result.data.sortBy,
      sortOrder,
    });

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Error in audit logs API:', error);

    if (error instanceof Error && error.message === 'Database query timeout') {
      return NextResponse.json({ error: 'Query timed out' }, { status: 504 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

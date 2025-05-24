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
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = Object.fromEntries(new URL(req.url).searchParams.entries());
  const result = querySchema.safeParse({
    ...raw,
    page: raw.page ? parseInt(raw.page) : undefined,
    limit: raw.limit ? parseInt(raw.limit) : undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', details: result.error.errors },
      { status: 400 }
    );
  }

  const { userId, page, limit, ...filters } = result.data;
  const targetUserId = userId ?? user.id;

  if (userId && userId !== user.id) {
    const allowed = await hasPermission(user.id, 'VIEW_ALL_USER_ACTION_LOGS');
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const service = getApiAuditService();
  const { logs, count } = await service.getLogs({
    ...filters,
    page,
    limit,
    userId: targetUserId,
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
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth/utils';
import { hasPermission } from '@/lib/auth/hasPermission';
import { getServiceSupabase } from '@/lib/database/supabase';

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

    const supabase = getServiceSupabase();

    let query = supabase
      .from('user_actions_log')
      .select('*', { count: 'exact' })
      .eq('user_id', targetUserId);

    if (action) query = query.eq('action', action);
    if (status) query = query.eq('status', status);
    if (resourceType) query = query.eq('target_resource_type', resourceType);
    if (resourceId) query = query.eq('target_resource_id', resourceId);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    query = query.order('created_at', { ascending: sortOrder === 'asc' });

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const logs = await Promise.race([
      query.range(from, to),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      ),
    ]);

    return NextResponse.json({
      logs: logs.data || [],
      pagination: {
        page,
        limit,
        total: logs.count || 0,
        totalPages: logs.count ? Math.ceil(logs.count / limit) : 0,
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

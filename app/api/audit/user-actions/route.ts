import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { hasPermission } from '@/lib/auth/hasPermission';
import { middleware } from '@/middleware';

// Query parameters schema for filtering user actions
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
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['created_at', 'action', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const GET = middleware(
  ['cors', 'csrf', 'rateLimit'],
  async (req: NextRequest) => {
    try {
      // Get user from request (set by auth middleware)
      const user = (req as any).user;
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Parse and validate query parameters
      const searchParams = Object.fromEntries(new URL(req.url).searchParams);
      const {
        startDate,
        endDate,
        userId,
        action,
        status,
        resourceType,
        resourceId,
        ipAddress,
        userAgent,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      } = querySchema.parse({
        ...searchParams,
        page: searchParams.page ? parseInt(searchParams.page) : undefined,
        limit: searchParams.limit ? parseInt(searchParams.limit) : undefined,
      });

      // RBAC: Users can only see their own logs unless they have permission
      let targetUserId = userId || user.id;
      if (userId && userId !== user.id) {
        // Only allow admins to view other users' logs
        if (!await hasPermission(user.id, 'VIEW_ALL_USER_ACTION_LOGS')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      // Build query
      let query = supabase
        .from('user_actions_log')
        .select('*', { count: 'exact' })
        .eq('user_id', targetUserId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      if (action) {
        query = query.eq('action', action);
      }
      if (status) {
        query = query.eq('status', status);
      }
      if (resourceType) {
        query = query.eq('target_resource_type', resourceType);
      }
      if (resourceId) {
        query = query.eq('target_resource_id', resourceId);
      }
      if (ipAddress) {
        query = query.ilike('ip_address', `%${ipAddress}%`);
      }
      if (userAgent) {
        query = query.ilike('user_agent', `%${userAgent}%`);
      }
      if (search) {
        // Free-text search across action, details, error, target_resource_id/type
        // Supabase/Postgres: use ilike for partial, case-insensitive match
        query = query.or(`action.ilike.%${search}%,details::text.ilike.%${search}%,error.ilike.%${search}%,target_resource_id.ilike.%${search}%,target_resource_type.ilike.%${search}%`);
      }

      // Sorting and pagination
      query = query
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range((page - 1) * limit, page * limit - 1);

      // Execute query
      const { data: logs, error, count } = await query;
      if (error) {
        console.error('Error fetching user action logs:', error);
        return NextResponse.json({ error: 'Failed to fetch user action logs' }, { status: 500 });
      }

      return NextResponse.json({
        logs,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: count ? Math.ceil(count / limit) : 0,
        },
      });
    } catch (error) {
      console.error('Error in user action logs endpoint:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
);

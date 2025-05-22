import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuditProvider } from '@/adapters/audit/factory';
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
      const targetUserId = userId || user.id;
      if (userId && userId !== user.id) {
        // Only allow admins to view other users' logs
        if (!await hasPermission(user.id, 'VIEW_ALL_USER_ACTION_LOGS')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }

      const provider = createAuditProvider({
        type: 'supabase',
        options: {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        },
      });

      const { logs, count } = await provider.getUserActionLogs({
        page,
        limit,
        userId: targetUserId,
        action,
        status,
        resourceType,
        resourceId,
        startDate,
        endDate,
        ipAddress,
        userAgent,
        search,
        sortBy,
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
      console.error('Error in user action logs endpoint:', error);
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 });
      }
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
);

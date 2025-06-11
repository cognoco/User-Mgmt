import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getApiAuditService } from "@/services/audit/factory";
import { hasPermission } from "@/lib/auth/hasPermission";
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  rateLimitMiddleware,
} from "@/middleware/createMiddlewareChain";
import { withSecurity } from "@/middleware/withSecurity";
import type { RouteAuthContext } from "@/middleware/auth";

// Query parameters schema for filtering user actions
const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  status: z.enum(["SUCCESS", "FAILURE", "INITIATED", "COMPLETED"]).optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sortBy: z.enum(["created_at", "action", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

const middleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware({ includeUser: true }),
]);

async function handleGet(
  req: NextRequest,
  auth: RouteAuthContext,
) {
  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    page = 1,
    limit = 20,
    sortBy = "created_at",
    sortOrder = "desc",
  } = querySchema.parse({
    ...searchParams,
    page: searchParams.page ? parseInt(searchParams.page) : undefined,
    limit: searchParams.limit ? parseInt(searchParams.limit) : undefined,
  });

  const targetUserId = userId || auth.userId;
  if (userId && userId !== auth.userId) {
    if (!(await hasPermission(auth.userId, "VIEW_ALL_USER_ACTION_LOGS"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const service = getApiAuditService();
  if (!service) {
    return NextResponse.json(
      { error: "Audit service not available" },
      { status: 500 },
    );
  }

  const { logs, count } = await service.getLogs({
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
}

export const GET = withSecurity((req: NextRequest) =>
  middleware((r, auth) => handleGet(r, auth))(req)
);

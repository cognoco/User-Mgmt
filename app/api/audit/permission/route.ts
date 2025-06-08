import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getApiAuditService } from "@/services/audit/factory";
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  rateLimitMiddleware,
} from "@/middleware/createMiddlewareChain";
import { withSecurity } from "@/middleware/withSecurity";
import type { RouteAuthContext } from "@/middleware/auth";

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
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

  const params = querySchema.parse(
    Object.fromEntries(new URL(req.url).searchParams.entries()),
  );

  const service = getApiAuditService();
  if (!service) {
    return NextResponse.json(
      { error: "Audit service not available" },
      { status: 500 },
    );
  }

  const { logs, count } = await service.getLogs({
    ...params,
    resourceType: "permission",
  });

  return NextResponse.json({
    logs,
    pagination: {
      page: params.page,
      limit: params.limit,
      total: count,
      totalPages: Math.ceil(count / params.limit),
    },
  });
}

export const GET = withSecurity((req: NextRequest) =>
  middleware((r, auth) => handleGet(r, auth))(req)
);

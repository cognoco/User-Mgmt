import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getApiAuditService } from "@/services/audit/factory";
import { middleware } from "@/middleware";

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

export const GET = middleware(
  ["cors", "csrf", "rateLimit"],
  async (req: NextRequest) => {
    try {
      const user = (req as any).user;
      if (!user) {
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
    } catch (error) {
      console.error("Error in permission audit endpoint:", error);
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid query parameters", details: error.errors },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },
);

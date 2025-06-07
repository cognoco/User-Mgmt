import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/resources/[type]/[id]/ancestors/route";

// Mock permission middleware to bypass auth
vi.mock("@/middleware/auth", () => ({
  withRouteAuth: vi.fn((handler: any, req: any) =>
    handler(req, { userId: "u1" }),
  ),
}));
vi.mock("@/middleware/error-handling", () => ({
  withErrorHandling: (handler: any, req: any) => handler(req),
}));

const resolverMock = { getResourceAncestors: vi.fn() };
vi.mock("@/services/permission/resource-permission-resolver", () => ({
  ResourcePermissionResolver: vi.fn(() => resolverMock),
}));
vi.mock("@/lib/database/supabase", () => ({
  getServiceSupabase: vi.fn(() => ({})),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resource ancestors API", () => {
  it("returns ancestors", async () => {
    resolverMock.getResourceAncestors.mockResolvedValue([
      { resourceType: "team", resourceId: "t1" },
    ]);
    const req = new NextRequest("http://test");
    const res = await GET(req, {
      params: { type: "project", id: "p1" },
    } as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.ancestors).toEqual([
      { resourceType: "team", resourceId: "t1" },
    ]);
    expect(resolverMock.getResourceAncestors).toHaveBeenCalledWith(
      "project",
      "p1",
    );
  });
});

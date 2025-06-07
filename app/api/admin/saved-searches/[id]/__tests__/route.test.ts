import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, PATCH, DELETE } from "@/app/api/admin/saved-searches/[id]/route";

vi.mock("@/middleware/createMiddlewareChain", async () => {
  const actual = await vi.importActual<any>(
    "@/middleware/createMiddlewareChain",
  );
  return {
    ...actual,
    routeAuthMiddleware: vi.fn(
      () => (handler: any) => (req: any, ctx?: any, data?: any) =>
        handler(req, { userId: "u1" }, data),
    ),
    validationMiddleware: vi.fn(
      () => (handler: any) => (req: any, ctx?: any) =>
        handler(req, ctx, { name: "n" }),
    ),
    errorHandlingMiddleware: vi.fn(() => (handler: any) => handler),
    createMiddlewareChain: (m: any[]) => (h: any) => h,
  };
});

vi.mock("@/middleware/with-security", () => ({
  withSecurity: vi.fn((fn: any) => fn),
}));

vi.mock("@/services/saved-search/factory", () => ({
  getApiSavedSearchService: vi.fn(),
}));

import { getApiSavedSearchService } from "@/services/savedSearch/factory";

function createReq(method: string) {
  return {
    method,
    url: "http://localhost/api/admin/saved-searches/1",
    nextUrl: { pathname: "/api/admin/saved-searches/1" },
    json: vi.fn().mockResolvedValue({ name: "n" }),
  } as unknown as NextRequest;
}

describe("saved search id API", () => {
  const service = {
    getSavedSearch: vi.fn(),
    updateSavedSearch: vi.fn(),
    deleteSavedSearch: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getApiSavedSearchService).mockReturnValue(service);
    service.getSavedSearch.mockResolvedValue({ id: "1" });
    service.updateSavedSearch.mockResolvedValue({ id: "1" });
    service.deleteSavedSearch.mockResolvedValue(undefined);
  });

  it("calls service on GET", async () => {
    const res = await GET(createReq("GET"), { params: { id: "1" } } as any);
    expect(res.status).toBe(200);
    expect(service.getSavedSearch).toHaveBeenCalled();
  });

  it("calls service on PATCH", async () => {
    const res = await PATCH(createReq("PATCH"), { params: { id: "1" } } as any);
    expect(res.status).toBe(200);
    expect(service.updateSavedSearch).toHaveBeenCalled();
  });

  it("calls service on DELETE", async () => {
    const res = await DELETE(createReq("DELETE"), {
      params: { id: "1" },
    } as any);
    expect(res.status).toBe(204);
    expect(service.deleteSavedSearch).toHaveBeenCalled();
  });
});

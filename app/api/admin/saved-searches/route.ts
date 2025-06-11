import { type NextRequest } from "next/server";
import { z } from "zod";
import { createSuccessResponse, createCreatedResponse } from "@/lib/api/common";
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware,
} from "@/middleware/createMiddlewareChain";
import type { RouteAuthContext } from "@/middleware/auth";
import { withSecurity } from "@/middleware/withSecurity";
import { getApiSavedSearchService } from "@/services/saved-search/factory";
import { Permission } from "@/lib/rbac/roles";

const savedSearchParamsSchema = z.object({
  query: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended", "all"]).optional(),
  role: z.string().optional(),
  dateCreatedStart: z.string().optional(),
  dateCreatedEnd: z.string().optional(),
  dateLastLoginStart: z.string().optional(),
  dateLastLoginEnd: z.string().optional(),
  sortBy: z
    .enum(["name", "email", "createdAt", "lastLoginAt", "status"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  teamId: z.string().optional(),
});

const createSavedSearchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  searchParams: savedSearchParamsSchema,
  isPublic: z.boolean().optional(),
});

async function getAllSavedSearches(_req: NextRequest, auth: RouteAuthContext) {
  if (!auth.userId) {
    return createSuccessResponse({ savedSearches: [] });
  }
  const service = getApiSavedSearchService();
  const searches = await service.listSavedSearches(auth.userId);
  return createSuccessResponse({ savedSearches: searches });
}

async function createSavedSearch(
  _req: NextRequest,
  auth: RouteAuthContext,
  data: z.infer<typeof createSavedSearchSchema>,
) {
  if (!auth.userId) {
    throw new Error("Authentication required");
  }
  const service = getApiSavedSearchService();
  const savedSearch = await service.createSavedSearch({
    userId: auth.userId,
    name: data.name,
    description: data.description,
    searchParams: data.searchParams,
    isPublic: data.isPublic ?? false,
  });
  return createCreatedResponse({ savedSearch });
}

const getMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: [Permission.ACCESS_ADMIN_DASHBOARD] }),
]);

const postMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: [Permission.ACCESS_ADMIN_DASHBOARD] }),
  validationMiddleware(createSavedSearchSchema),
]);

export const GET = (req: NextRequest) =>
  getMiddleware((r, auth) => getAllSavedSearches(r, auth))(req);

export const POST = (req: NextRequest) =>
  withSecurity((r) =>
    postMiddleware((r2, auth, data) => createSavedSearch(r2, auth, data))(r),
  )(req);

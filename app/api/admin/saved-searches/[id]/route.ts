import { type NextRequest } from "next/server";
import { z } from "zod";
import {
  createSuccessResponse,
  createNoContentResponse,
} from "@/lib/api/common";
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware,
} from "@/middleware/createMiddlewareChain";
import type { RouteAuthContext } from "@/middleware/auth";
import { withSecurity } from "@/middleware/withSecurity";
import { getApiSavedSearchService } from "@/services/saved-search/factory";
import { PermissionValues } from "@/lib/rbac/roles";

const updateSavedSearchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  searchParams: z.record(z.any()).optional(),
  isPublic: z.boolean().optional(),
});

async function getSavedSearch(
  _req: NextRequest,
  auth: RouteAuthContext,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!auth.userId) {
    throw new Error("Authentication required");
  }
  const service = getApiSavedSearchService();
  const { id } = await params;
  const savedSearch = await service.getSavedSearch(id, auth.userId);
  if (!savedSearch) {
    throw new Error("Failed to fetch saved search");
  }
  return createSuccessResponse({ savedSearch });
}

async function updateSavedSearch(
  _req: NextRequest,
  auth: RouteAuthContext,
  data: z.infer<typeof updateSavedSearchSchema>,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!auth.userId) {
    throw new Error("Authentication required");
  }
  const service = getApiSavedSearchService();
  const { id } = await params;
  const updatedSearch = await service.updateSavedSearch(
    id,
    auth.userId,
    {
      name: data.name,
      description: data.description,
      searchParams: data.searchParams,
      isPublic: data.isPublic,
    },
  );
  return createSuccessResponse({ savedSearch: updatedSearch });
}

async function deleteSavedSearch(
  _req: NextRequest,
  auth: RouteAuthContext,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!auth.userId) {
    throw new Error("Authentication required");
  }
  const service = getApiSavedSearchService();
  const { id } = await params;
  await service.deleteSavedSearch(id, auth.userId);
  return createNoContentResponse();
}

const baseMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: [PermissionValues.ACCESS_ADMIN_DASHBOARD] }),
]);

const patchMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: [PermissionValues.ACCESS_ADMIN_DASHBOARD] }),
  validationMiddleware(updateSavedSearchSchema),
]);

export const GET = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  baseMiddleware((r, auth) => getSavedSearch(r, auth, ctx))(req);

export const PATCH = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  withSecurity((r) =>
    patchMiddleware((r2, auth, data) => updateSavedSearch(r2, auth, data, ctx))(
      r,
    ),
  )(req);

export const DELETE = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  withSecurity((r) =>
    baseMiddleware((r2, auth) => deleteSavedSearch(r2, auth, ctx))(r),
  )(req);

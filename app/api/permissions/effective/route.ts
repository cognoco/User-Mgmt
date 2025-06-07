import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createResourcePermissionResolver } from '@/lib/services/resourcePermissionResolver.service';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware,
} from '@/middleware/createMiddlewareChain';
import { createSuccessResponse } from '@/lib/api/common';

const querySchema = z.object({
  resourceType: z.string().min(1),
  resourceId: z.string().min(1),
});

const middleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(querySchema),
]);

async function handleGet(req: NextRequest, auth: any, data: z.infer<typeof querySchema>) {
  const userId = auth.userId;
  const { resourceType, resourceId } = data;

  const resolver = createResourcePermissionResolver();
  const permissions = await resolver.getEffectivePermissions(
    userId,
    resourceType,
    resourceId
  );

  const ancestors = await resolver.getResourceAncestors(
    resourceType,
    resourceId
  );

  return createSuccessResponse({
    permissions,
    ancestors,
    resourceType,
    resourceId
  });
}

export const GET = middleware(handleGet);

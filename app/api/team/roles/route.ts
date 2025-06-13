import { type NextRequest } from 'next/server';
import { createSuccessResponse } from '@/lib/api/common';
import { getAllRoles } from '@/lib/rbac/roles';
import {
  createMiddlewareChain,
  errorHandlingMiddleware
} from '@/middleware/createMiddlewareChain';

async function handleGet() {
  const roles = getAllRoles();
  return createSuccessResponse({ roles });
}

const middleware = createMiddlewareChain([
  errorHandlingMiddleware()
]);

export function GET(req: NextRequest) {
  return middleware(() => handleGet())(req);
}

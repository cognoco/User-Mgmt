import { NextRequest } from 'next/server';
import { createSuccessResponse } from '@/lib/api/common';
import { getAllRoles } from '@/lib/rbac/roles';
import { withErrorHandling } from '@/middleware/error-handling';

async function handleGet() {
  const roles = getAllRoles();
  return createSuccessResponse({ roles });
}

export async function GET(req: NextRequest) {
  return withErrorHandling(() => handleGet(), req);
}

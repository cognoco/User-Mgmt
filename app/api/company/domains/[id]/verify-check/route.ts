import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getApiCompanyService } from '@/services/company/factory';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { checkRateLimit } from '@/middleware/rateLimit';
import { logUserAction } from '@/lib/audit/auditLogger';
import { ApiError, ERROR_CODES, createSuccessResponse } from '@/lib/api/common';

async function handlePost(request: NextRequest, params: Promise<{ id: string }>, auth: { userId?: string }) {
  if (await checkRateLimit(request, { windowMs: 15 * 60 * 1000, max: 10 })) {
    throw new ApiError(ERROR_CODES.OPERATION_FAILED, 'Too many requests', 429);
  }

  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Extract id outside try block so it's available in catch
  const { id } = await params;

  try {
    const companyService = getApiCompanyService();
    const result = await companyService.checkDomainVerification(id, auth.userId!);

    await logUserAction({
      userId: auth.userId,
      action: 'DOMAIN_VERIFICATION_CHECK',
      status: result.verified ? 'SUCCESS' : 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'company',
      targetResourceId: id,
    });

    return createSuccessResponse({ verified: result.verified, message: result.message }, result.verified ? 200 : 400);
  } catch (error: any) {
    await logUserAction({
      userId: auth.userId,
      action: 'DOMAIN_VERIFICATION_CHECK_FAILED',
      status: 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'company',
      targetResourceId: id,
      details: { error: error?.message }
    });

    const message = error?.message || 'Domain verification failed';
    if (/not found/i.test(message)) {
      throw new ApiError(ERROR_CODES.NOT_FOUND, message, 404);
    }
    if (/initiated/i.test(message)) {
      throw new ApiError(ERROR_CODES.INVALID_REQUEST, message, 400);
    }
    throw new ApiError(ERROR_CODES.INTERNAL_ERROR, message, 500);
  }
}

export const POST = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  createApiHandler(z.object({}), (r, a) => handlePost(r, ctx.params, a), { requireAuth: true })(req);

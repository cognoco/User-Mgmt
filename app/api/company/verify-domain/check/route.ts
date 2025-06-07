import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { checkRateLimit } from '@/middleware/rateLimit';
import { getApiCompanyService } from '@/services/company/factory';
import { logUserAction } from '@/lib/audit/auditLogger';
import { ApiError, ERROR_CODES, createSuccessResponse } from '@/lib/api/common';

async function handlePost(request: NextRequest, _data: unknown, auth: { userId?: string }) {
  if (await checkRateLimit(request, { windowMs: 15 * 60 * 1000, max: 10 })) {
    throw new ApiError(ERROR_CODES.OPERATION_FAILED, 'Too many requests', 429);
  }

  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    const service = getApiCompanyService();
    const result = await service.checkProfileDomainVerification(auth.userId!);

    await logUserAction({
      userId: auth.userId,
      action: 'PROFILE_DOMAIN_VERIFICATION_CHECK',
      status: result.verified ? 'SUCCESS' : 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'company',
    });

    return createSuccessResponse({ verified: result.verified, message: result.message }, result.verified ? 200 : 400);
  } catch (error: any) {
    await logUserAction({
      userId: auth.userId,
      action: 'PROFILE_DOMAIN_VERIFICATION_CHECK_FAILED',
      status: 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'company',
      details: { error: error?.message }
    });

    const msg = error?.message || 'Verification failed';
    if (/initiated/i.test(msg)) {
      throw new ApiError(ERROR_CODES.INVALID_REQUEST, msg, 400);
    }
    throw new ApiError(ERROR_CODES.INTERNAL_ERROR, msg, 500);
  }
}

export const POST = createApiHandler(z.object({}), handlePost, { requireAuth: true });

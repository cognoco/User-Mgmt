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

  try {
    const { id } = await params;
    const companyService = getApiCompanyService();
    const result = await companyService.initiateDomainVerification(id, auth.userId!);

    await logUserAction({
      userId: auth.userId,
      action: 'DOMAIN_VERIFICATION_INITIATED',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'company',
      targetResourceId: id,
    });

    return createSuccessResponse({
      domain: result.domain,
      verificationToken: result.verificationToken,
      message: 'Domain verification initiated. Add the token as a TXT record in your DNS.'
    });
  } catch (error: any) {
    await logUserAction({
      userId: auth.userId,
      action: 'DOMAIN_VERIFICATION_INITIATED',
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
    if (/permission/i.test(message)) {
      throw new ApiError(ERROR_CODES.FORBIDDEN, message, 403);
    }
    throw new ApiError(ERROR_CODES.INTERNAL_ERROR, message, 500);
  }
}

export const POST = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) =>
  createApiHandler(z.object({}), (r, a) => handlePost(r, ctx.params, a), { requireAuth: true })(req);

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createBillingPortalSession } from '@/lib/payments/stripe';
import {
  createSuccessResponse,
  createValidationError,
  createServerError,
  ApiError,
  ERROR_CODES,
} from '@/lib/api/common';
import { checkRateLimit } from '@/middleware/rateLimit';
import { logUserAction } from '@/lib/audit/auditLogger';

const bodySchema = z.object({ customerId: z.string() });

/**
 * Create a Stripe billing portal session for the given customer.
 */
export async function POST(req: NextRequest) {
  const isRateLimited = await checkRateLimit(req);
  if (isRateLimited) {
    throw new ApiError(ERROR_CODES.INVALID_REQUEST, 'Too many requests', 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw createValidationError('Invalid JSON');
  }
  const parse = bodySchema.safeParse(body);
  if (!parse.success) {
    throw createValidationError('Invalid payload', parse.error.flatten());
  }

  try {
    const session = await createBillingPortalSession({
      customer: parse.data.customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });
    await logUserAction({
      action: 'SUBSCRIPTION_PORTAL_CREATED',
      status: 'SUCCESS',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    });
    return createSuccessResponse({ url: session.url });
  } catch (err: any) {
    await logUserAction({
      action: 'SUBSCRIPTION_PORTAL_CREATED',
      status: 'FAILURE',
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      details: { error: err.message },
    });
    throw createServerError(err.message);
  }
}

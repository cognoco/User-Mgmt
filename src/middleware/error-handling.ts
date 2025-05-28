import { NextRequest, NextResponse } from 'next/server';
import { ApiError, toApiError } from '@/lib/api';
import { createErrorResponse } from '@/lib/api/common/response-formatter';
import { logError } from '@/lib/audit/error-logger';

/**
 * Middleware to handle API errors for route handlers.
 */
export async function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>,
  req: NextRequest
): Promise<NextResponse> {
  try {
    return await handler(req);
  } catch (error) {
    const apiError = toApiError(error);
    await logError(apiError, {
      ip: req.headers.get('x-forwarded-for') || undefined,
      ua: req.headers.get('user-agent') || undefined,
    });
    return createErrorResponse(apiError);
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/api/common/api-error';
import { createErrorResponse } from '@/lib/api/common/response-formatter';
import { logUserAction } from '@/lib/audit/auditLogger';

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
    console.error('API Error:', error);
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError(
            'server/internal_error',
            error instanceof Error ? error.message : 'An unexpected error occurred',
            500
          );

    try {
      await logUserAction({
        action: 'API_ERROR',
        status: 'FAILURE',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        targetResourceType: 'api',
        targetResourceId: req.nextUrl.pathname,
        details: { code: apiError.code, message: apiError.message }
      });
    } catch (logErr) {
      console.error('Failed to log API error:', logErr);
    }

    return createErrorResponse(apiError);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/api/common/api-error';
import { createErrorResponse } from '@/lib/api/common/response-formatter';
import { logApiError } from '@/lib/audit/error-logger';

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
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError(
            'SERVER_GENERAL_001',
            error instanceof Error ? error.message : 'An unexpected error occurred',
            500
          );

    // Log to console for easier debugging during development/testing
    console.error('API error:', apiError);

    await logApiError(apiError, {
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      path: req.nextUrl?.pathname || req.url || 'unknown',
    });

    const safeError =
      process.env.NODE_ENV === 'production' && apiError.status >= 500
        ? new ApiError(apiError.code, 'Internal server error', apiError.status)
        : apiError;

    return createErrorResponse(safeError);
  }
}

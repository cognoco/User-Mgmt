import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/lib/api/common/api-error';
import { createErrorResponse } from '@/lib/api/common/response-formatter';

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

    if (error instanceof ApiError) {
      return createErrorResponse(error);
    }

    const serverError = new ApiError(
      'server/internal_error',
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500
    );

    return createErrorResponse(serverError);
  }
}

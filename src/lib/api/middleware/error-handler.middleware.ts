import { NextRequest, NextResponse } from 'next/server';
import { logApiError } from '@/lib/audit/error-logger';
import {
  ApplicationError,
  createErrorFromUnknown,
} from '@/core/common/errors';
import { createErrorResponse, ResponseMeta } from '../response/api-response';

export interface ErrorHandlerContext extends ResponseMeta {
  service?: string;
  operation?: string;
}

function sanitizeError(error: ApplicationError): ApplicationError {
  const sanitized = new ApplicationError(
    error.code,
    error.message,
    error.httpStatus,
    error.details && { ...error.details }
  );
  sanitized.timestamp = error.timestamp;
  return sanitized;
}

export async function withApiErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>,
  req: NextRequest,
  context: ErrorHandlerContext = {}
): Promise<NextResponse> {
  try {
    return await handler(req);
  } catch (err) {
    const appErr = createErrorFromUnknown(err);
    await logApiError(appErr, {
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
      path: req.nextUrl.pathname,
    });
    const safe = process.env.NODE_ENV === 'development' ? appErr : sanitizeError(appErr);
    const meta: ResponseMeta = {
      requestId: context.requestId || '',
      timestamp: safe.timestamp,
    };
    const body = createErrorResponse(safe, meta);
    return NextResponse.json(body, { status: safe.httpStatus });
  }
}

export function handleApiError(
  error: unknown,
  context: ErrorHandlerContext = {}
): NextResponse {
  const appErr = createErrorFromUnknown(error);
  const safe = process.env.NODE_ENV === 'development' ? appErr : sanitizeError(appErr);
  const body = createErrorResponse(safe, {
    requestId: context.requestId || '',
    timestamp: safe.timestamp,
  });
  return NextResponse.json(body, { status: safe.httpStatus });
}

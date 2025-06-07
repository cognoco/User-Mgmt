import { NextRequest, NextResponse } from 'next/server';
import { createRateLimit } from '@/src/middleware/rateLimit';

// Stricter rate limits for auth endpoints
const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30 // 30 requests per 15 minutes for auth endpoints
});

/**
 * Wrapper for auth routes that applies rate limiting
 * Use this for login, registration, password reset, etc.
 */
export async function withAuthRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return authRateLimit(request, handler);
} 
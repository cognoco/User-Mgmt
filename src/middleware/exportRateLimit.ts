import { NextRequest, NextResponse } from 'next/server';
import { getApiDataExportService } from '@/services/data-export';
import { isCompanyRateLimited } from '@/lib/exports/companyExport.service';

/**
 * Check if user is rate limited for personal data exports
 * @param userId User ID
 * @returns Boolean indicating if user is rate limited
 */
export async function checkUserExportRateLimit(userId: string): Promise<boolean> {
  const service = getApiDataExportService();
  return service.isUserRateLimited(userId);
}

/**
 * Check if company is rate limited for company data exports
 * @param companyId Company ID
 * @returns Boolean indicating if company is rate limited
 */
export async function checkCompanyExportRateLimit(companyId: string): Promise<boolean> {
  return isCompanyRateLimited(companyId);
}

/**
 * Middleware to apply export-specific rate limits
 * @param request NextRequest
 * @param handler Request handler function
 * @param options Options for rate limiting
 * @returns NextResponse
 */
export async function withExportRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    type: 'user' | 'company';
    userId: string;
    companyId?: string;
  }
): Promise<NextResponse> {
  try {
    const { type, userId, companyId } = options;
    
    // Check rate limit based on export type
    const isRateLimited = type === 'user'
      ? await checkUserExportRateLimit(userId)
      : (companyId ? await checkCompanyExportRateLimit(companyId) : false);
    
    if (isRateLimited) {
      return NextResponse.json(
        {
          error: 'Too many export requests. Please wait before requesting another export.',
          retryAfter: 15 * 60 // 15 minutes in seconds
        },
        { status: 429 }
      );
    }
    
    // Process the request if not rate limited
    return handler(request);
  } catch (error) {
    console.error('Export rate limiting error:', error);
    // If rate limiting check fails, still process the request (fail open)
    return handler(request);
  }
} 
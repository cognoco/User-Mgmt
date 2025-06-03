// Create file: lib/api/route-helpers.ts
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { AuthContext } from '@/lib/auth/types';
import { createAuthMiddleware } from '@/lib/auth/unified-auth.middleware';
import { ApiError, ERROR_CODES } from '@/lib/api/common';

export const createApiHandler = <T extends z.ZodTypeAny>(
  schema: T,
  handler: (
    req: NextRequest, 
    context: AuthContext, 
    data: z.infer<T>
  ) => Promise<NextResponse> | NextResponse,
  options?: {
    requireAuth?: boolean;
    requiredPermissions?: string[];
    includeUser?: boolean;
  }
) => {
  return createAuthMiddleware(options)(
    async (req: NextRequest, context: AuthContext) => {
      try {
        // Parse request body or query params based on method
        let data: any;
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
          data = await req.json();
        } else {
          const url = new URL(req.url);
          data = Object.fromEntries(url.searchParams.entries());
        }
        
        // Validate data
        const result = schema.safeParse(data);
        if (!result.success) {
          throw new ApiError(
            ERROR_CODES.VALIDATION_ERROR,
            'Invalid request parameters',
            400,
            result.error.format()
          );
        }
        
        // Call handler with validated data
        return handler(req, context, result.data);
      } catch (error) {
        if (error instanceof ApiError) {
          return NextResponse.json(
            { 
              error: {
                message: error.message,
                code: error.code,
                details: error.details
              }
            }, 
            { status: error.statusCode }
          );
        }
        
        console.error('Unexpected error:', error);
        return NextResponse.json(
          { 
            error: {
              message: 'An unexpected error occurred',
              code: ERROR_CODES.INTERNAL_ERROR
            }
          },
          { status: 500 }
        );
      }
    }
  );
};

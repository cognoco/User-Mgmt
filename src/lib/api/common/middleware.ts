/**
 * API Middleware Functions
 * 
 * Standardized middleware for API routes across all domains.
 * This module provides consistent authentication, error handling, and request validation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { ApiError } from './api-error';
import { createErrorResponse } from './response-formatter';
import { getApiAuthService } from '../auth/factory';

/**
 * Middleware to handle API errors
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
    
    // Handle unknown errors
    const serverError = new ApiError(
      'server/internal_error',
      error instanceof Error ? error.message : 'An unexpected error occurred',
      500
    );
    
    return createErrorResponse(serverError);
  }
}

/**
 * Middleware to validate request body against a schema
 */
export async function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (req: NextRequest, validatedData: T) => Promise<NextResponse>,
  req: NextRequest
): Promise<NextResponse> {
  try {
    const body = await req.json();
    const validatedData = schema.parse(body);
    return await handler(req, validatedData);
  } catch (error) {
    if (error.name === 'ZodError') {
      const validationError = new ApiError(
        'validation/error',
        'Validation failed',
        400,
        { errors: error.errors }
      );
      return createErrorResponse(validationError);
    }
    
    throw error;
  }
}

/**
 * Middleware to require authentication
 */
export async function withAuth(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>,
  req: NextRequest
): Promise<NextResponse> {
  try {
    const authService = getApiAuthService();
    const session = await authService.getSession(req.headers.get('authorization') || '');
    
    if (!session || !session.user?.id) {
      const unauthorizedError = new ApiError(
        'auth/unauthorized',
        'Authentication required',
        401
      );
      return createErrorResponse(unauthorizedError);
    }
    
    return await handler(req, session.user.id);
  } catch (error) {
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

/**
 * Middleware to require specific permissions
 */
export async function withPermission(
  permission: string,
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>,
  req: NextRequest
): Promise<NextResponse> {
  return withAuth(async (req, userId) => {
    // TODO: Implement permission checking using the permission service
    // This is a placeholder for now
    const hasPermission = true;
    
    if (!hasPermission) {
      const forbiddenError = new ApiError(
        'auth/forbidden',
        `You don't have permission to perform this action`,
        403
      );
      return createErrorResponse(forbiddenError);
    }
    
    return await handler(req, userId);
  }, req);
}

/**
 * Combine multiple middleware functions
 */
export function composeMiddleware(
  ...middlewares: Array<(handler: any, req: NextRequest) => Promise<NextResponse>>
) {
  return (handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>) => {
    return (req: NextRequest) => {
      return middlewares.reduceRight(
        (acc, middleware) => () => middleware(acc, req),
        (req: NextRequest) => handler(req)
      )(req);
    };
  };
}

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withSecurity } from '@/middleware/with-security';
import { logUserAction } from '@/lib/audit/auditLogger';
import { getApiAuthService } from '@/services/auth/factory';
import { LoginPayload } from '@/core/auth/models';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import {
  createMiddlewareChain,
  validationMiddleware,
  rateLimitMiddleware
} from '@/middleware/createMiddlewareChain';
import { createInvalidCredentialsError, createEmailNotVerifiedError } from '@/lib/api/auth/error-handler';

// Zod schema for login data (matches original)
const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(), 
});

/**
 * Login handler function that processes the actual login request
 * after validation has been performed
 */
async function handleLogin(req: NextRequest, ctx: any, validatedData: z.infer<typeof LoginSchema>) {
  // Get IP and User Agent for logging
  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const { email, password, rememberMe } = validatedData;
  
  // 1. Get AuthService and call login method
  const authService = getApiAuthService();
  const loginPayload: LoginPayload = {
    email,
    password,
    rememberMe: rememberMe || false
  };
  
  const authResult = await authService.login(loginPayload);

  // 2. Handle Login Errors
  if (!authResult.success) {
    console.error('Login error:', authResult.error);
    
    // Log the failed login attempt
    await logUserAction({
      action: 'LOGIN_FAILURE',
      status: 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      targetResourceId: email,
      details: { reason: authResult.error }
    });

    // Handle specific error cases
    if (authResult.error?.includes('Invalid login credentials')) {
      throw createInvalidCredentialsError();
    } 
    if (authResult.error?.includes('Email not confirmed')) {
      throw createEmailNotVerifiedError();
    }
    
    // Generic authentication failure
    throw new ApiError(
      ERROR_CODES.UNAUTHORIZED,
      authResult.error || 'Authentication failed',
      401
    );
  }

  // 3. Handle Success
  if (!authResult.user) {
    console.error('Login successful but no user returned');
    throw new ApiError(
      ERROR_CODES.INTERNAL_ERROR,
      'Login failed unexpectedly after authentication',
      500
    );
  }

  // Check if user has MFA enabled
  const hasMfaEnabled = authResult.user.mfaEnabled;
  
  // Log successful login
  await logUserAction({
    userId: authResult.user.id,
    action: 'LOGIN_SUCCESS',
    status: 'SUCCESS',
    ipAddress,
    userAgent,
    targetResourceType: 'auth',
    targetResourceId: authResult.user.id,
    details: { requiresMfa: hasMfaEnabled }
  });

  // Include MFA status in response
  console.log('Login successful for:', email, rememberMe ? '(with extended session)' : '');
  
  return createSuccessResponse({
    user: authResult.user,
    token: authResult.token,
    requiresMfa: hasMfaEnabled,
    expiresAt: authResult.expiresAt
  });
}

/**
 * POST handler for login endpoint
 */
const middleware = createMiddlewareChain([
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 30 }),
  validationMiddleware(LoginSchema)
]);

export const POST = withSecurity((request: NextRequest) =>
  withErrorHandling(middleware(handleLogin), request)
);

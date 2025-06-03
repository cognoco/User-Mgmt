import { z } from 'zod';
import { createApiHandler } from '@/lib/api/route-helpers';
import { logUserAction } from '@/lib/audit/auditLogger';
import { LoginPayload } from '@/core/auth/models';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import { createInvalidCredentialsError, createEmailNotVerifiedError } from '@/lib/api/auth/error-handler';

// Zod schema for login data
const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional(), 
});

/**
 * POST handler for login endpoint
 */
export const POST = createApiHandler(
  LoginSchema,
  async (request, _authContext, data, services) => {
    // Get IP and User Agent for logging
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const { email, password, rememberMe } = data;
    
    // Prepare login payload
    const loginPayload: LoginPayload = {
      email,
      password,
      rememberMe: rememberMe || false
    };
    
    // Call auth service to login
    const authResult = await services.auth.login(loginPayload);

    // Handle Login Errors
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

    // Handle Success
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
  },
  { 
    requireAuth: false, // Login doesn't require auth
    rateLimit: { windowMs: 15 * 60 * 1000, max: 30 } // Rate limiting config
  }
);

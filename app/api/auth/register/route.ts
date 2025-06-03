import { z } from 'zod';
import { createApiHandler } from '@/lib/api/route-helpers';
import { logUserAction } from '@/lib/audit/auditLogger';
import { associateUserWithCompanyByDomain } from '@/lib/auth/domainMatcher';
import { User } from '@/core/auth/models';
import {
  createSuccessResponse,
  createCreatedResponse,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';
import { createUserAlreadyExistsError } from '@/lib/api/user/error-handler';

// Extended interfaces for registration that include corporate fields
interface ExtendedRegistrationPayload {
  email: string;
  password: string;
  userType: 'private' | 'corporate';
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  companyName?: string;
  companyWebsite?: string;
  department?: string;
  industry?: string;
  companySize?: string;
  position?: string;
  metadata?: Record<string, any>;
}

// Extended AuthResult that includes user field
interface ExtendedAuthResult {
  success: boolean;
  error?: string;
  code?: 'EMAIL_NOT_VERIFIED' | 'INVALID_CREDENTIALS' | 'RATE_LIMIT_EXCEEDED' | 'MFA_REQUIRED';
  requiresMfa?: boolean;
  token?: string;
  retryAfter?: number;
  remainingAttempts?: number;
  user?: User;
  requiresEmailConfirmation?: boolean;
}

// Zod schema for registration data
const RegistrationSchema = z.discriminatedUnion('userType', [
  z.object({
    userType: z.literal('private'),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' })
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, { message: 'Password must contain at least one special character' }),
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions and privacy policy',
    }),
  }),
  z.object({
    userType: z.literal('corporate'),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' })
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, { message: 'Password must contain at least one special character' }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().min(1, { message: 'Company name is required' }),
    companyWebsite: z.string().optional().refine(
      (val) => !val || /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/\S*)?$/.test(val),
      { message: 'Please enter a valid website URL' }
    ),
    department: z.string().optional(),
    industry: z.string().optional(),
    companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', 'Other/Not Specified']).optional(),
    position: z.string().optional(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions and privacy policy',
    }),
  })
]);

/**
 * POST handler for registration endpoint
 */
export const POST = createApiHandler(
  RegistrationSchema,
  async (request, _authContext, regData, services) => {
    // Get IP and User Agent for logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Prepare registration payload for the AuthService
    const registrationPayload = {
      email: regData.email,
      password: regData.password,
      firstName: regData.userType === 'private' ? regData.firstName : (regData.firstName || ''),
      lastName: regData.userType === 'private' ? regData.lastName : (regData.lastName || ''),
      metadata: {
        userType: regData.userType,
        acceptTerms: regData.acceptTerms,
        // Add corporate-specific fields if applicable
        ...(regData.userType === 'corporate' && {
          companyName: regData.companyName,
          companyWebsite: regData.companyWebsite || '',
          department: regData.department || '',
          industry: regData.industry || '',
          companySize: regData.companySize || 'Other/Not Specified',
          position: regData.position || ''
        })
      }
    };
    
    // Call the auth service to register the user
    const authResult = (await services.auth.register(registrationPayload)) as ExtendedAuthResult;

    // Handle Registration Errors
    if (!authResult.success) {
      // Log the failed registration attempt
      await logUserAction({
        action: 'REGISTER_FAILURE',
        status: 'FAILURE',
        ipAddress,
        userAgent,
        targetResourceType: 'auth',
        targetResourceId: regData.email,
        details: { reason: authResult.error }
      });

      // Handle specific error cases
      if (authResult.error?.includes('already exists')) {
        throw createUserAlreadyExistsError(regData.email);
      }
      
      // Generic registration failure
      throw new ApiError(
        ERROR_CODES.INVALID_REQUEST,
        authResult.error || 'Registration failed',
        400
      );
    }

    // Handle Success
    if (!authResult.user) {
      // Log the unexpected error
      await logUserAction({
        action: 'REGISTER_UNEXPECTED_ERROR',
        status: 'FAILURE',
        ipAddress,
        userAgent,
        targetResourceType: 'auth',
        targetResourceId: regData.email,
        details: { message: 'Registration successful but no user data returned' }
      });
      
      console.error('Registration successful but no user data returned');
      throw new ApiError(
        ERROR_CODES.INTERNAL_ERROR,
        'Registration failed unexpectedly',
        500
      );
    }

    // Log successful registration
    await logUserAction({
      userId: authResult.user.id,
      action: 'REGISTER_SUCCESS',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      targetResourceId: authResult.user.id,
      details: { email: authResult.user.email }
    });

    // Attempt to associate with company by domain (if applicable)
    if (authResult.user.email) {
      try {
        await associateUserWithCompanyByDomain(authResult.user.id, authResult.user.email);
      } catch (error) {
        console.warn('Failed to associate user with company by domain:', error);
        // Non-critical error, continue with registration success
      }
    }

    console.log('Registration successful for:', regData.email);
    
    return createCreatedResponse({
      user: authResult.user,
      token: authResult.token,
      requiresEmailConfirmation: authResult.requiresEmailConfirmation
    });
  },
  { 
    requireAuth: false, // Registration doesn't require auth
    rateLimit: { windowMs: 15 * 60 * 1000, max: 10 } // Stricter rate limiting for registration
  }
);
import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { withSecurity } from '@/middleware/with-security';
import { logUserAction } from '@/lib/audit/auditLogger';
import { associateUserWithCompanyByDomain } from '@/lib/auth/domainMatcher';
import { getApiAuthService } from '@/services/auth/factory';
import { User } from '@/core/auth/models';
import {
  createSuccessResponse,
  createCreatedResponse,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  validationMiddleware,
  rateLimitMiddleware
} from '@/middleware/createMiddlewareChain';
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

// Zod schema for registration data (matches original)
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
 * Registration handler function that processes the actual registration request
 * after validation has been performed
 */
async function handleRegistration(req: NextRequest, ctx?: any, validatedData?: z.infer<typeof RegistrationSchema>) {
  if (!validatedData) {
    throw new ApiError(
      ERROR_CODES.INVALID_REQUEST,
      'Invalid or missing request data',
      400
    );
  }

  // Get IP and User Agent for logging
  const ipAddress = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const regData = validatedData;
  
  // 1. Get AuthService and prepare registration payload
  const authService = getApiAuthService();
  
  // Prepare registration payload for the AuthService (base fields only)
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
  
  // 3. Call the auth service to register the user
  const authResult = (await authService.register(registrationPayload)) as ExtendedAuthResult;

  // 4. Handle Registration Errors
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

  // 5. Handle Success
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

  // 6. Handle domain-based company association for private users
  let domainAssociationResult = null;
  if (regData.userType === 'private') {
    domainAssociationResult = await associateUserWithCompanyByDomain(
      authResult.user.id,
      authResult.user.email || ''
    );
    
    if (domainAssociationResult.matched) {
      // If a domain match was found, log the association
      await logUserAction({
        userId: authResult.user.id,
        action: 'COMPANY_DOMAIN_ASSOCIATION',
        status: domainAssociationResult.success ? 'SUCCESS' : 'FAILURE',
        ipAddress,
        userAgent,
        targetResourceType: 'company',
        targetResourceId: domainAssociationResult.companyId || '',
        details: { 
          success: domainAssociationResult.success,
          companyName: domainAssociationResult.companyName,
          error: domainAssociationResult.error
        }
      });
    }
  }

  // Return success message and user data (without session if verification is needed)
  return createCreatedResponse({
    message: 'Registration successful. Please check your email to verify your account.',
    user: authResult.user,
    companyAssociation: domainAssociationResult?.matched ? {
      success: domainAssociationResult.success,
      companyName: domainAssociationResult.companyName
    } : null
  });
}

const middleware = createMiddlewareChain([
  rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 30 }),
  errorHandlingMiddleware(),
  validationMiddleware(RegistrationSchema)
]);

export const POST = withSecurity((request: NextRequest) =>
  middleware(handleRegistration)(request)
);
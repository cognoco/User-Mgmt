import { z } from 'zod';
import { createApiHandler } from '@/lib/api/routeHelpers';
import { User } from '@/core/auth/models';
import {
  createSuccessResponse,
  createCreatedResponse,
  ApiError,
  ERROR_CODES
} from '@/lib/api/common';
import { createUserAlreadyExistsError } from '@/lib/api/user/errorHandler';

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
    // Extract request context for the service
    const context = {
      ipAddress: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    };
    
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
    
    // Call the auth service with context - all business logic is now in the service
    const authResult = await services.auth.register(registrationPayload, context);

    // Handle Registration Errors - service now handles audit logging and company association
    if (!authResult.success) {
      console.error('Registration error:', authResult.error);
      
      // Handle specific error cases based on service classification
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

    // Handle Success - service now includes all necessary data
    if (!authResult.user) {
      console.error('Registration successful but no user data returned');
      throw new ApiError(
        ERROR_CODES.INTERNAL_ERROR,
        'Registration failed unexpectedly',
        500
      );
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
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/middleware/rate-limit';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { logUserAction } from '@/lib/audit/auditLogger';
import { associateUserWithCompanyByDomain } from '@/lib/auth/domainMatcher';
import { getApiAuthService } from '@/lib/api/auth/factory';
import { RegistrationPayload } from '@/core/auth/models';

// Zod schema for registration data (matches original)
const RegistrationSchema = z.discriminatedUnion('userType', [
  z.object({
    userType: z.literal('private'),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions and privacy policy',
    }),
  }),
  z.object({
    userType: z.literal('corporate'),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
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

async function handler(request: NextRequest): Promise<NextResponse> {
  // Get IP and User Agent early
  const ipAddress = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
  const userAgent = request.headers.get('user-agent');
  let emailForLogging: string | null = null; // Variable to hold email for logging

  if (request.method !== 'POST') {
    return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    // 1. Rate Limiting
    const isRateLimited = await checkRateLimit(request);
    if (isRateLimited) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 2. Parse and Validate Body
    const parseResult = RegistrationSchema.safeParse(body);

    if (!parseResult.success) {
      emailForLogging = body?.email; // Attempt to get email for logging
      const errors = parseResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const regData = parseResult.data;
    emailForLogging = regData.email;
    
    // 3. Get AuthService and prepare registration payload
    const authService = getApiAuthService();
    
    // Prepare registration payload for the AuthService
    const registrationPayload: RegistrationPayload = {
      email: regData.email,
      password: regData.password,
      userType: regData.userType,
      firstName: regData.userType === 'private' ? regData.firstName : (regData.firstName || ''),
      lastName: regData.userType === 'private' ? regData.lastName : (regData.lastName || ''),
      acceptTerms: regData.acceptTerms,
      // Add corporate-specific fields if applicable
      ...(regData.userType === 'corporate' && {
        companyName: regData.companyName,
        companyWebsite: regData.companyWebsite || '',
        department: regData.department || '',
        industry: regData.industry || '',
        companySize: regData.companySize || 'Other/Not Specified',
        position: regData.position || ''
      }),
      // Add redirect URL for email verification
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?source=registration`
    };

    // Call AuthService register method
    const authResult = await authService.register(registrationPayload);

    // 4. Handle Registration Errors
    if (!authResult.success) {
      // Log the failed registration attempt
      await logUserAction({
          action: 'REGISTER_FAILURE',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'auth',
          targetResourceId: regData.email,
          details: { 
              reason: authResult.error
          }
      });

      // Handle specific error cases
      if (authResult.error?.includes('already exists')) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      }
      
      // Generic registration failure
      return NextResponse.json({ error: authResult.error || 'Registration failed.' }, { status: 400 });
    }

    // 5. Handle Success
    if (!authResult.user) {
      // Log the unexpected error
      await logUserAction({
          action: 'REGISTER_UNEXPECTED_ERROR',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'auth',
          targetResourceId: emailForLogging, 
          details: { message: 'Registration successful but no user data returned' }
      });
      console.error('Registration successful but no user data returned');
      return NextResponse.json({ error: 'Registration failed unexpectedly.' }, { status: 500 });
    }

    // Log successful registration
    await logUserAction({
        userId: authResult.user.id,
        action: 'REGISTER_SUCCESS',
        status: 'SUCCESS',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'auth',
        targetResourceId: authResult.user.id,
        details: { email: authResult.user.email } // Log email as detail
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
          ipAddress: ipAddress,
          userAgent: userAgent,
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
    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: authResult.user,
      companyAssociation: domainAssociationResult?.matched ? {
        success: domainAssociationResult.success,
        companyName: domainAssociationResult.companyName
      } : null
    }); // Default 200 OK
  } catch (error) {
    // 7. Handle Unexpected Errors
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Log the unexpected error
    await logUserAction({
        action: 'REGISTER_UNEXPECTED_ERROR',
        status: 'FAILURE',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'auth',
        targetResourceId: emailForLogging, // Use stored email if available
        details: { error: message }
    });

    return NextResponse.json({ error: 'Registration failed. Please try again.', details: message }, { status: 500 });
  }
}

// Apply rate limiting and security middleware
export const POST = withSecurity(
  async (request: NextRequest) => withAuthRateLimit(request, handler)
); 
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/middleware/rate-limit';
import { withSecurity } from '@/middleware/security';
import { withAuthRateLimit } from '@/middleware/rate-limit';
import { getApiAuthService } from '@/lib/api/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';

// Zod schema for account deletion request
const DeleteAccountSchema = z.object({
  password: z.string().min(1, { message: 'Password confirmation is required.' }),
});

async function handler(request: NextRequest) {
  // Get IP and User Agent early for logging
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  let userId: string | undefined;
  let userEmail: string | undefined;

  try {
    // 1. Get AuthService
    const authService = getApiAuthService();
    
    // 2. Get current user
    const user = authService.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    userId = user.id;
    userEmail = user.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found, cannot verify password.' }, { status: 400 });
    }

    // 3. Parse and Validate Body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = DeleteAccountSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.format() }, { status: 400 });
    }
    const { password } = parseResult.data;

    console.log('Account deletion attempt initiated for user:', userId);
    
    // Log the account deletion attempt
    await logUserAction({
      userId,
      action: 'ACCOUNT_DELETION_INITIATED',
      status: 'PENDING',
      ipAddress,
      userAgent,
      targetResourceType: 'account',
      targetResourceId: userId
    });

    // 4. Delete account using the AuthService
    const result = await authService.deleteAccount({
      userId,
      password
    });
    
    // 5. Handle the result
    if (!result.success) {
      console.error('Account deletion failed for user:', userId, result.error);
      
      // Log the failed deletion
      await logUserAction({
        userId,
        action: 'ACCOUNT_DELETION_FAILED',
        status: 'FAILURE',
        ipAddress,
        userAgent,
        targetResourceType: 'account',
        targetResourceId: userId,
        details: { error: result.error }
      });
      
      // Return appropriate error based on the error type
      if (result.error === 'INVALID_PASSWORD') {
        return NextResponse.json({ error: 'Incorrect password provided.' }, { status: 401 });
      } else {
        return NextResponse.json({ error: result.error || 'Account deletion failed.' }, { status: 500 });
      }
    }
    
    // Log the successful deletion
    await logUserAction({
      action: 'ACCOUNT_DELETION_COMPLETED',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'account',
      targetResourceId: userId
    });

    console.log('Account deletion successful for user:', userId);

    // Return success
    // Client should handle redirecting or signing out locally
    return NextResponse.json({ message: 'Account successfully deleted.' });

  } catch (error) {
    // Handle Unexpected Errors
    console.error('Account deletion process error for user:', userId, error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Log the error
    await logUserAction({
      userId,
      action: 'ACCOUNT_DELETION_ERROR',
      status: 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'account',
      targetResourceId: userId,
      details: { error: message }
    });
    
    // Avoid sending specific details unless it was a known validation/auth error handled above
    return NextResponse.json({ error: 'Account deletion failed due to an unexpected error.' }, { status: 500 });
  }
}

// Apply rate limiting and security middleware
export const DELETE = withSecurity(
  async (request: NextRequest) => withAuthRateLimit(request, handler)
);

// GET handler to fetch account info
async function getHandler(request: NextRequest) {
  // Get IP and User Agent early for logging
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  try {
    // Get AuthService
    const authService = getApiAuthService();
    
    // Get current user
    const user = authService.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Get user account details
    const accountDetails = await authService.getUserAccount(user.id);
    
    // Log the account info request
    await logUserAction({
      userId: user.id,
      action: 'ACCOUNT_INFO_REQUESTED',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'account',
      targetResourceId: user.id
    });
    
    return NextResponse.json(accountDetails);
  } catch (error) {
    console.error('Error fetching account info:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Log the error
    await logUserAction({
      action: 'ACCOUNT_INFO_ERROR',
      status: 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'account',
      details: { error: message }
    });
    
    return NextResponse.json({ error: 'Failed to fetch account information' }, { status: 500 });
  }
}

// Apply rate limiting and security middleware for GET
export const GET = withSecurity(
  async (request: NextRequest) => withAuthRateLimit(request, getHandler)
);
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { logUserAction } from '@/lib/audit/auditLogger';
import { getApiAuthService } from '@/lib/api/auth/factory';
import { User } from '@/core/auth/models';

// Zod schema for password update
const UpdatePasswordSchema = z.object({
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
});

async function handler(request: NextRequest): Promise<NextResponse> {
  const ipAddress = request.ip;
  const userAgent = request.headers.get('user-agent');
  let userIdForLogging: string | null = null;

  if (request.method !== 'POST') {
    return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get AuthService
    const authService = getApiAuthService();

    // Get the current user
    const currentUser = authService.getCurrentUser();

    if (!currentUser) {
      // Log unauthorized attempt if possible
      await logUserAction({
          action: 'PASSWORD_UPDATE_UNAUTHORIZED',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'auth',
          details: { reason: 'No user session found' }
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userIdForLogging = currentUser.id; // Store for logging

    const body = await request.json();
    
    // Validate request body
    const parseResult = UpdatePasswordSchema.safeParse(body);
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const { password } = parseResult.data;

    try {
      // Update password using AuthService
      // Since we're setting a new password without knowing the old one (password reset flow),
      // we'll pass an empty string as the old password
      await authService.updatePassword('', password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      
      // Log the failed password update
      await logUserAction({
          userId: userIdForLogging,
          action: 'PASSWORD_UPDATE_FAILURE',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'auth',
          targetResourceId: userIdForLogging,
          details: { reason: errorMessage }
      });
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Log successful password update
    await logUserAction({
        userId: userIdForLogging,
        action: 'PASSWORD_UPDATE_SUCCESS',
        status: 'SUCCESS',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'auth',
        targetResourceId: userIdForLogging
    });

    return NextResponse.json({
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Password update error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';

    // Log the unexpected error
    await logUserAction({
        userId: userIdForLogging, // May be null if error happened before user fetch
        action: 'PASSWORD_UPDATE_UNEXPECTED_ERROR',
        status: 'FAILURE',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'auth',
        targetResourceId: userIdForLogging,
        details: { error: message }
    });

    return NextResponse.json(
      { error: 'Failed to update password. Please try again.' },
      { status: 500 }
    );
  }
}

// Apply rate limiting and security middleware
export const POST = withSecurity(
  async (request: NextRequest) => withAuthRateLimit(request, handler)
); 
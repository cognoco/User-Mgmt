import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
import { withAuthRateLimit } from '@/middleware/with-auth-rate-limit';
import { withSecurity } from '@/middleware/with-security';
import { logUserAction } from '@/lib/audit/auditLogger';
import { User } from '@supabase/supabase-js';

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
    const supabase = getServiceSupabase();

    // Get the current user from the session/token
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      // Log unauthorized attempt if possible
      await logUserAction({
          action: 'PASSWORD_UPDATE_UNAUTHORIZED',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'auth',
          details: { reason: userError?.message ?? 'No user session found' }
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userIdForLogging = user.id; // Store for logging

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

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      // Log the failed password update
      await logUserAction({
          userId: userIdForLogging,
          action: 'PASSWORD_UPDATE_FAILURE',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'auth',
          targetResourceId: userIdForLogging,
          details: { 
              reason: updateError.message, 
              code: updateError.code, 
              status: updateError.status 
          }
      });
      return NextResponse.json({ error: updateError.message }, { status: updateError.status || 400 });
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
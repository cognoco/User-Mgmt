import { type NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/middleware/rate-limit';
import { getApiAuthService } from '@/lib/api/auth/factory';
import { logUserAction } from '@/lib/audit/auditLogger';

export async function POST(request: NextRequest) {
  // Get IP and User Agent early for logging
  const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Get AuthService
    const authService = getApiAuthService();
    
    // Get current user for logging purposes
    const currentUser = authService.getCurrentUser();
    const userId = currentUser?.id;
    
    // 3. Call logout method on AuthService
    await authService.logout();
    
    // 4. Log the successful logout
    if (userId) {
      await logUserAction({
        userId,
        action: 'LOGOUT_SUCCESS',
        status: 'SUCCESS',
        ipAddress,
        userAgent,
        targetResourceType: 'auth',
        targetResourceId: userId
      });
    }
    
    // 5. Handle Success
    console.log('Logout successful');
    return NextResponse.json({ message: 'Successfully logged out' }); // 200 OK

  } catch (error) {
    // 6. Handle Unexpected Errors
    console.error('Unexpected Logout API error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Log the error
    await logUserAction({
      action: 'LOGOUT_ERROR',
      status: 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'auth',
      details: { error: message }
    });
    
    return NextResponse.json({ error: 'An internal server error occurred.', details: message }, { status: 500 });
  }
}
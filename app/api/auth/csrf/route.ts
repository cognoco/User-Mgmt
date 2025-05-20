import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { withSecurity } from '@/middleware/security';
import { getCSRFToken } from '@/middleware/csrf';
import { logUserAction } from '@/lib/audit/auditLogger';

async function handler(req: NextRequest) {
  // Get IP and User Agent for logging
  const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  try {
    const token = getCSRFToken(req);
    
    // Log the CSRF token generation
    await logUserAction({
      action: 'CSRF_TOKEN_GENERATED',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      targetResourceType: 'security'
    });
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    
    // Log the error
    await logUserAction({
      action: 'CSRF_TOKEN_ERROR',
      status: 'FAILURE',
      ipAddress,
      userAgent,
      targetResourceType: 'security',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

export const GET = withSecurity(handler, {
  skipMiddlewares: ['csrf'] // Skip CSRF check for the token endpoint
});
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// Configuration
const cookieName = 'csrf-token';
const secure = process.env.NODE_ENV === 'production';
const sameSite = 'strict' as const;

/**
 * Generate a simple CSRF token without complex service dependencies
 */
function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export async function GET() {
  try {
    // Generate a simple CSRF token
    const token = generateCSRFToken();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Failed to generate CSRF token' },
        { status: 500 }
      );
    }

    // Create the response with the token
    const response = NextResponse.json({ csrfToken: token }, { status: 200 });

    // Set the HttpOnly cookie
    response.cookies.set(cookieName, token, {
      path: '/',
      httpOnly: true,
      secure: secure,
      sameSite: sameSite,
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import { getApiCsrfService } from '@/lib/api/csrf/factory';

// Configuration (consider moving to a shared config if used elsewhere)
const cookieName = 'csrf-token';
const secure = process.env.NODE_ENV === 'production';
const sameSite = 'strict';

export async function GET() {
  try {
    const csrfService = getApiCsrfService();
    const { token } = await csrfService.generateToken();
    const response = NextResponse.json({ csrfToken: token }, { status: 200 });

    // Set the HttpOnly cookie
    response.cookies.set(cookieName, token, {
      path: '/',
      httpOnly: true,
      secure: secure,
      sameSite: sameSite,
      // Consider adding maxAge or expires if needed
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
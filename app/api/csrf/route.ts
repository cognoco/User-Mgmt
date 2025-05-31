import { NextResponse } from 'next/server';
import { getApiCSRFService } from '@/services/csrf/factory';
import initializeApp from '@/core/initialization/app-init';

// Configuration (consider moving to a shared config if used elsewhere)
const cookieName = 'csrf-token';
const secure = process.env.NODE_ENV === 'production';
const sameSite = 'strict';

export async function GET() {
  // Ensure all adapters/services are registered
  initializeApp();
  try {
    const csrfService = getApiCSRFService();
    const { token } = await csrfService.createToken();
    if (!token || !token.token) {
      return NextResponse.json(
        { error: 'Failed to generate CSRF token' },
        { status: 500 }
      );
    }
    const response = NextResponse.json({ csrfToken: token.token }, { status: 200 });

    // Set the HttpOnly cookie
    response.cookies.set(cookieName, token.token, {
      path: '/',
      httpOnly: true,
      secure: secure,
      sameSite: sameSite,
      maxAge: 60 * 60 * 24,
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
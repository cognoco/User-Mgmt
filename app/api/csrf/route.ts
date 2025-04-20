import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// Configuration (consider moving to a shared config if used elsewhere)
const cookieName = 'csrf-token';
const secure = process.env.NODE_ENV === 'production';
const sameSite = 'strict';

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function GET() {
  try {
    const token = generateToken();
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
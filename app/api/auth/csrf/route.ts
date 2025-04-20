import { NextResponse } from 'next/server';
import { type NextApiRequest } from 'next';
import { withSecurity } from '@/middleware';
import { getCSRFToken } from '@/middleware/csrf';

async function handler(req: NextApiRequest) {
  try {
    const token = getCSRFToken(req);
    return NextResponse.json({ token });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}

export const GET = withSecurity(handler, {
  skipMiddlewares: ['csrf'] // Skip CSRF check for the token endpoint
}); 
import { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';

interface CSRFOptions {
  cookieName?: string;
  headerName?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

const defaultOptions: Required<CSRFOptions> = {
  cookieName: 'csrf-token',
  headerName: 'X-CSRF-Token',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict'
};

// Generate a random token
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// Validate that the token from the header matches the cookie
function validateToken(cookie: string | undefined, header: string | undefined): boolean {
  if (!cookie || !header) return false;
  return cookie === header;
}

export function csrf(options: CSRFOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  return async function csrfMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => Promise<void>
  ) {
    try {
      // Skip CSRF check for non-mutating methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method?.toUpperCase() || '')) {
        // For GET requests, set a new CSRF token if one doesn't exist
        const existingToken = req.cookies[opts.cookieName];
        if (!existingToken) {
          const newToken = generateToken();
          res.setHeader('Set-Cookie', [
            `${opts.cookieName}=${newToken}; Path=/; HttpOnly; ${opts.secure ? 'Secure; ' : ''}SameSite=${opts.sameSite}`
          ]);
        }
        await next();
        return;
      }

      // For mutating methods (POST, PUT, DELETE, etc.), validate the token
      const cookieToken = req.cookies[opts.cookieName];
      const headerToken = req.headers[opts.headerName.toLowerCase()];

      if (!validateToken(cookieToken, headerToken as string)) {
        res.status(403).json({ error: 'Invalid CSRF token' });
        return;
      }

      // Generate a new token after successful validation
      const newToken = generateToken();
      res.setHeader('Set-Cookie', [
        `${opts.cookieName}=${newToken}; Path=/; HttpOnly; ${opts.secure ? 'Secure; ' : ''}SameSite=${opts.sameSite}`
      ]);

      await next();
    } catch (error) {
      console.error('CSRF middleware error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
}

// Export a function to get a CSRF token for the client
export function getCSRFToken(req: NextApiRequest): string | null {
  return req.cookies[defaultOptions.cookieName] || null;
} 
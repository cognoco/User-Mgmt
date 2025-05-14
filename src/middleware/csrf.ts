import { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';

export interface CSRFOptions {
  cookieName?: string;
  headerName?: string;
  cookieOptions?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: boolean | 'strict' | 'lax' | 'none';
    maxAge?: number;
    path?: string;
  };
  excludeMethods?: string[];
}

/**
 * Get CSRF token from cookies
 * @param req Request object
 * @param options CSRF options
 * @returns CSRF token or null if not found
 */
export function getCSRFToken(
  req: NextApiRequest,
  options: CSRFOptions = {}
): string | null {
  const cookieName = options.cookieName || 'csrf-token';
  return req.cookies[cookieName] || null;
}

/**
 * Set CSRF token in cookies
 * @param res Response object
 * @param token CSRF token
 * @param options CSRF options
 */
function setCSRFToken(
  res: NextApiResponse,
  token: string,
  options: CSRFOptions = {}
): void {
  const cookieName = options.cookieName || 'csrf-token';
  const isProduction = process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
    ...(options.cookieOptions || {}),
  };
  
  const cookieStr = `${cookieName}=${token}; Max-Age=${cookieOptions.maxAge}; Path=${cookieOptions.path}${
    cookieOptions.httpOnly ? '; HttpOnly' : ''
  }${cookieOptions.secure ? '; Secure' : ''}${
    cookieOptions.sameSite ? `; SameSite=${cookieOptions.sameSite}` : ''
  }`;
  
  res.setHeader('Set-Cookie', [cookieStr]);
}

/**
 * Generate a new CSRF token
 * @returns CSRF token
 */
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * CSRF protection middleware
 * @param options CSRF options
 * @returns Middleware function
 */
export function csrf(options: CSRFOptions = {}) {
  const excludeMethods = options.excludeMethods || ['GET', 'HEAD', 'OPTIONS'];
  const headerName = options.headerName || 'x-csrf-token';
  
  return async function csrfMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => Promise<void>
  ) {
    // Skip CSRF check for excluded methods
    if (excludeMethods.includes(req.method || '')) {
      // Generate token if not exists for GET requests
      if (req.method === 'GET' && !getCSRFToken(req, options)) {
        const token = generateToken();
        setCSRFToken(res, token, options);
      }
      
      await next();
      return;
    }
    
    // For non-excluded methods, validate CSRF token
    const cookieToken = getCSRFToken(req, options);
    const headerToken = req.headers[headerName] as string;
    
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      res.status(403).json({ error: 'Invalid CSRF token' });
      return;
    }
    
    await next();
  };
} 
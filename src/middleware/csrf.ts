import { NextApiRequest, NextApiResponse } from 'next';
import { randomBytes } from 'crypto';
import { ApiError, ERROR_CODES, createErrorResponse } from '@/lib/api/common';

/**
 * Configuration options for the {@link csrf} middleware.
 */
export interface CSRFOptions {
  /** Name of the cookie used to store the token */
  cookieName?: string;
  /** Name of the request header containing the token */
  headerName?: string;
  /** Cookie settings for the CSRF token */
  cookieOptions?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: boolean | 'strict' | 'lax' | 'none';
    maxAge?: number;
    path?: string;
  };
  /** HTTP methods excluded from validation */
  excludeMethods?: string[];
}

/**
 * Retrieve the CSRF token from the incoming request cookies.
 *
 * @param req     The {@link NextApiRequest} object.
 * @param options Optional {@link CSRFOptions}.
 * @returns The token value or `null` when not present.
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
 * Create a CSRF protection middleware for Next.js API routes.
 *
 * The middleware verifies that the request contains a matching token in both
 * a cookie and a header. A new token is issued for safe methods when missing.
 *
 * @param options Optional {@link CSRFOptions} to customize behaviour.
 * @returns Middleware function compatible with Next.js API handlers.
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
      const error = new ApiError(
        ERROR_CODES.FORBIDDEN,
        'Invalid CSRF token',
        403
      );
      res.status(403).json(error.toResponse());
      return;
    }
    
    await next();
  };
} 


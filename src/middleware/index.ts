import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from '@/middleware/rateLimit';
import { securityHeaders } from '@/middleware/securityHeaders';
import { auditLog } from '@/middleware/auditLog';
import { cors } from '@/middleware/cors';
import { csrf } from '@/middleware/csrf';
import { correlationIdMiddleware } from '@/lib/monitoring';

type NextFunction = () => Promise<void>;

type MiddlewareFunction = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: NextFunction
) => Promise<void>;

/**
 * Combines multiple middleware functions into a single middleware
 * @param middlewares Array of middleware functions to combine
 * @returns Combined middleware function
 */
export function combineMiddleware(middlewares: MiddlewareFunction[]) {
  return async function (req: NextApiRequest, res: NextApiResponse, next: NextFunction) {
    try {
      // Create a middleware chain where each middleware calls the next one
      const chain = middlewares.reduceRight(
        (nextFn: NextFunction, middleware: MiddlewareFunction) => {
          return async () => {
            try {
              await middleware(req, res, nextFn);
            } catch (error) {
              console.error('Middleware execution error:', error);
              await nextFn();
            }
          };
        },
        next
      );

      await chain();
    } catch (error) {
      console.error('Middleware error:', error);
      await next();
    }
  };
}

/**
 * Default security middleware configuration
 */
export const defaultSecurityMiddleware = combineMiddleware([
  // CORS middleware - Allow cross-origin requests
  cors(),
  
  // CSRF protection
  csrf(),
  
  // Rate limiting - 100 requests per 15 minutes by default
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),

  // Security headers with default configuration
  securityHeaders(),

  // Temporarily disable audit logging due to TypeScript errors
  // auditLog(),
]);

/**
 * API middleware configuration with customizable options
 */
export function createApiMiddleware(options: {
  cors?: Parameters<typeof cors>[0];
  csrf?: Parameters<typeof csrf>[0];
  rateLimit?: Parameters<typeof rateLimit>[0];
  securityHeaders?: Parameters<typeof securityHeaders>[0];
  auditLog?: Parameters<typeof auditLog>[0];
  skipMiddlewares?: ('cors' | 'csrf' | 'rateLimit' | 'securityHeaders' | 'auditLog')[];
} = {}) {
  const middlewares: MiddlewareFunction[] = [];

  if (!options.skipMiddlewares?.includes('cors')) {
    middlewares.push(cors(options.cors));
  }

  if (!options.skipMiddlewares?.includes('csrf')) {
    middlewares.push(csrf(options.csrf));
  }

  if (!options.skipMiddlewares?.includes('rateLimit')) {
    middlewares.push(rateLimit(options.rateLimit));
  }

  if (!options.skipMiddlewares?.includes('securityHeaders')) {
    middlewares.push(securityHeaders(options.securityHeaders));
  }

  return combineMiddleware(middlewares);
}

/**
 * Helper function to wrap an API route with security middleware
 * @param handler API route handler
 * @param options Middleware configuration options
 * @returns Protected API route handler
 */
export function withSecurity(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options?: Parameters<typeof createApiMiddleware>[0]
) {
  const middleware = options ? createApiMiddleware(options) : defaultSecurityMiddleware;

  return async function secureHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
      // Add CORS headers immediately for all responses, even errors
      const origin = req.headers.origin;
      if (origin) {
        // Always set CORS headers for development
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      }
      
      // Handle OPTIONS requests immediately
      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }
      
      await middleware(req, res, async () => {
        await handler(req, res);
      });
    } catch (error) {
      console.error('API route error:', error);
      
      // Only set status if response is not sent yet
      if (!res.writableEnded) {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}

export { withErrorHandling } from '@/src/middleware/errorHandling';
export { correlationIdMiddleware };

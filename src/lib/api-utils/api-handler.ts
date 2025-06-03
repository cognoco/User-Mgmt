import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from '@/lib/api/common';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
/**
 * Configuration options for {@link createApiHandler}.
 */

export interface ApiHandlerConfig<T = any> {
  methods: HttpMethod[];
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<T>;
  requiresAuth?: boolean;
  requiredRoles?: string[];
  schema?: any; // You can use Zod, Joi, or similar for validation
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * Creates a type-safe API handler with built-in error handling and request validation.
 *
 * @param config - Handler configuration
 * @returns Next.js API route handler
 */
export function createApiHandler<T = any>(config: ApiHandlerConfig<T>) {
  const { methods, handler, requiresAuth = false, requiredRoles = [] } = config;

  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
    // Set default response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    try {
      // Validate HTTP method
      if (!methods.includes(req.method as HttpMethod)) {
        res.setHeader('Allow', methods);
        throw new ApiError('SERVER_GENERAL_004', `Method ${req.method} Not Allowed`, 405);
      }

      // Authentication check
      if (requiresAuth) {
        // Add your authentication logic here
        // Example: const session = await getSession({ req });
        // if (!session) throw new ApiError(401, 'Unauthorized');
      }


      // Authorization check
      if (requiredRoles.length > 0) {
        // Add your authorization logic here
        // Example: if (!requiredRoles.includes(user.role)) {
        //   throw new ApiError(403, 'Forbidden - Insufficient permissions');
        // }
      }


      // Validate request body/query if schema is provided
      if (config.schema) {
        try {
          config.schema.parse(
            req.method === 'GET' ? (req.query as any) : (req.body as any)
          );
        } catch (validationError: any) {
          throw new ApiError('VALIDATION_REQUEST_001', 'Validation Error', 400, {
            errors: validationError.errors ?? validationError,
          });
        }
      }

      // Execute the handler
      const result = await handler(req, res);

      // If headers were already sent by the handler, don't send another response
      if (res.headersSent) {
        return;
      }

      // Send success response
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      // Handle known ApiError
      if (error instanceof ApiError) {

        const status = typeof error.status === 'number' ? error.status : 500;
        return res.status(status).json({

          success: false,
          error: {
            code: error.code || 'API_ERROR',
            message: error.message,
            details: error.details,
          },
        });
      }

      // Handle unexpected errors
      console.error('API Error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    }
  };
}

/**
 * Creates a standardized API response
 */
export function createApiResponse<T = any>(
  data: T,
  meta?: ApiResponse['meta']
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: any
): ApiResponse<null> {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}

import { z, ZodType } from 'zod';

/** Options for route authentication middleware */
export const routeAuthOptionsSchema = z
  .object({
    optional: z.boolean().optional(),
    includeUser: z.boolean().optional(),
    requiredPermissions: z.array(z.string()).optional(),
    requiredRoles: z.array(z.string()).optional(),
  })
  .strict();
export type RouteAuthOptionsSchema = z.infer<typeof routeAuthOptionsSchema>;

/** Options for rate limiting middleware */
export const rateLimitOptionsSchema = z
  .object({
    windowMs: z.number().positive().optional(),
    max: z.number().int().positive().optional(),
    keyPrefix: z.string().optional(),
  })
  .strict();
export type RateLimitOptionsSchema = z.infer<typeof rateLimitOptionsSchema>;

/** Configuration object for building a middleware chain */
export const middlewareConfigSchema = z
  .object({
    errorHandling: z.boolean().optional().default(true),
    auth: routeAuthOptionsSchema.optional(),
    validationSchema: z.instanceof(ZodType).optional(),
    rateLimit: rateLimitOptionsSchema.optional(),
  })
  .strict();

export type MiddlewareConfig = z.infer<typeof middlewareConfigSchema>;

import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiAuthService } from '@/services/auth/factory';
import { ApiError } from '@/lib/api/common';
import { z } from 'zod';

/**
 * Zod schema for login
 */
const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
  rememberMe: z.boolean().optional()
});

/**
 * POST /api/auth/login
 * Delegates login logic to AuthService
 */
const loginHandler = createApiHandler({
  methods: ['POST'],
  async handler(req) {
    const parse = LoginSchema.safeParse(req.body);
    if (!parse.success) {
      throw new ApiError(400, 'Invalid credentials input', { details: parse.error.flatten() });
    }
    const authService = getApiAuthService();
    const result = await authService.login({
      email: parse.data.email,
      password: parse.data.password,
      rememberMe: parse.data.rememberMe ?? false
    });
    if (!result.success || !result.user) {
      throw new ApiError(401, result.error || 'Authentication failed');
    }
    return { user: result.user, token: result.token, expiresAt: result.expiresAt };
  }
});

/**
 * POST /api/auth/logout
 * Requires authentication
 */
const logoutHandler = createApiHandler({
  methods: ['POST'],
  requiresAuth: true,
  async handler() {
    const authService = getApiAuthService();
    await authService.logout();
    return { success: true };
  }
});

export default function handler(req: any, res: any) {
  const [action] = (req.query.auth as string[]) || [];
  switch (action) {
    case 'login':
      return loginHandler(req, res);
    case 'logout':
      return logoutHandler(req, res);
    default:
      return res.status(404).json({ error: 'Not Found' });
  }
}

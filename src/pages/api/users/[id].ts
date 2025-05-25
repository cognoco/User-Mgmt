import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiUserService } from '@/services/user/factory';
import { ApiError } from '@/lib/api/common';
import { z } from 'zod';

// Define validation schemas
const userIdSchema = z.string().uuid('Invalid user ID format');
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  // Add other user fields as needed
});

// GET /api/users/[id]
const getUserHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const { id } = req.query;
    
    // Validate user ID
    const validation = userIdSchema.safeParse(id);
    if (!validation.success) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const userService = getApiUserService();
    const user = await userService.getUserById(validation.data);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Omit sensitive data before sending response
    const { password: _password, ...safeUser } = user;
    return safeUser;
  },
});

// PATCH /api/users/[id]
const updateUserHandler = createApiHandler({
  methods: ['PATCH'],
  requiresAuth: true,
  // schema: createUserSchema.partial(), // Uncomment and use with validation
  async handler(req) {
    const { id } = req.query;
    const updateData = req.body;

    // Validate user ID
    const idValidation = userIdSchema.safeParse(id);
    if (!idValidation.success) {
      throw new ApiError(400, 'Invalid user ID');
    }

    // Validate update data (example using Zod)
    const dataValidation = createUserSchema.partial().safeParse(updateData);
    if (!dataValidation.success) {
      throw new ApiError(400, 'Invalid user data', {
        details: dataValidation.error.flatten(),
      });
    }

    const userService = getApiUserService();
    const updatedUser = await userService.updateUser(idValidation.data, dataValidation.data);
    
    const { password: _password, ...safeUser } = updatedUser;
    return safeUser;
  },
});

// DELETE /api/users/[id]
const deleteUserHandler = createApiHandler({
  methods: ['DELETE'],
  requiresAuth: true,
  requiredRoles: ['admin'],
  async handler(req) {
    const { id } = req.query;
    
    const validation = userIdSchema.safeParse(id);
    if (!validation.success) {
      throw new ApiError(400, 'Invalid user ID');
    }

    const userService = getApiUserService();
    await userService.deleteUser(validation.data);
    
    return { success: true };
  },
});

// Export the appropriate handler based on HTTP method
export default function handler(req: any, res: any) {
  switch (req.method) {
    case 'GET':
      return getUserHandler(req, res);
    case 'PATCH':
      return updateUserHandler(req, res);
    case 'DELETE':
      return deleteUserHandler(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Add type safety for API routes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

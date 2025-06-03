import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiAuditService } from '@/services/audit/factory';
import { ApiError } from '@/lib/api/common';
import { z } from 'zod';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  status: z.enum(['SUCCESS','FAILURE','INITIATED','COMPLETED']).optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc','desc']).optional()
});

const permissionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc','desc']).optional()
});

/**
 * GET /api/audit/logs
 */
const listHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const parse = querySchema.safeParse(req.query);
    if (!parse.success) {
      throw new ApiError(400, 'Invalid query');
    }
    const service = getApiAuditService();
    const result = await service.getLogs(parse.data);
    return result;
  }
});

const permissionListHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const parse = permissionQuerySchema.safeParse(req.query);
    if (!parse.success) {
      throw new ApiError(400, 'Invalid query');
    }
    const service = getApiAuditService();
    const result = await service.getLogs(parse.data);
    const regex = /^(ROLE_|PERMISSION_)/;
    const logs = result.logs.filter(l => regex.test(l.action));
    return { logs, count: logs.length };
  }
});

export default function handler(req: any, res: any) {
  const [action] = (req.query.audit as string[]) || [];
  switch(action){
    case 'permission':
      return permissionListHandler(req,res);
    case 'logs':
      return listHandler(req,res);
    default:
      return res.status(404).json({ error: 'Not Found' });
  }
}

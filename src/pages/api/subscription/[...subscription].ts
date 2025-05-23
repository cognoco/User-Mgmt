import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiSubscriptionService } from '@/services/subscription/factory';
import { ApiError } from '@/lib/api/common';
import { z } from 'zod';

const createSchema = z.object({ userId: z.string().uuid(), planId: z.string() });
const subIdSchema = z.object({ subscriptionId: z.string(), immediate: z.boolean().optional() });

/** Get plans */
const plansHandler = createApiHandler({
  methods: ['GET'],
  async handler() {
    const service = getApiSubscriptionService();
    const plans = await service.getPlans();
    return { plans };
  }
});

/** Create subscription */
const createHandler = createApiHandler({
  methods: ['POST'],
  requiresAuth: true,
  async handler(req) {
    const parse = createSchema.safeParse(req.body);
    if (!parse.success) throw new ApiError(400, 'Invalid payload');
    const service = getApiSubscriptionService();
    const result = await service.createSubscription(parse.data.userId, parse.data.planId);
    if (!result.success || !result.subscription) {
      throw new ApiError(400, result.error || 'Failed to create subscription');
    }
    return result.subscription;
  }
});

/** Cancel subscription */
const cancelHandler = createApiHandler({
  methods: ['DELETE'],
  requiresAuth: true,
  async handler(req) {
    const parse = subIdSchema.safeParse(req.body);
    if (!parse.success) throw new ApiError(400, 'Invalid payload');
    const service = getApiSubscriptionService();
    return service.cancelSubscription(parse.data.subscriptionId, parse.data.immediate);
  }
});

export default function handler(req: any, res: any) {
  const [action] = (req.query.subscription as string[]) || [];
  switch(action){
    case 'plans':
      if (req.method === 'GET') return plansHandler(req,res);
      break;
    case 'create':
      if (req.method === 'POST') return createHandler(req,res);
      break;
    case 'cancel':
      if (req.method === 'DELETE') return cancelHandler(req,res);
      break;
  }
  res.status(404).json({ error: 'Not Found' });
}

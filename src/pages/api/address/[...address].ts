import { createApiHandler } from '@/lib/api-utils/api-handler';
import { getApiAddressService } from '@/services/address/factory';
import { ApiError } from '@/lib/api/common';
import { addressSchema } from '@/core/address/validation';
import { z } from 'zod';

const userSchema = z.object({ userId: z.string().uuid() });
const idSchema = z.string();
const createSchema = addressSchema.extend({ userId: z.string().uuid() });
const updateSchema = addressSchema.partial().extend({ userId: z.string().uuid() });

/** List addresses */
const listHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const parse = userSchema.safeParse(req.query);
    if (!parse.success) throw new ApiError(400, 'Invalid parameters');
    const service = getApiAddressService();
    const addresses = await service.getAddresses(parse.data.userId);
    return { addresses };
  }
});

/** Create address */
const createHandler = createApiHandler({
  methods: ['POST'],
  requiresAuth: true,
  async handler(req) {
    const parse = createSchema.safeParse(req.body);
    if (!parse.success) throw new ApiError(400, 'Invalid payload', { details: parse.error.flatten() });
    const service = getApiAddressService();
    const address = await service.createAddress(parse.data as any);
    return { address };
  }
});

/** Get single address */
const getHandler = createApiHandler({
  methods: ['GET'],
  requiresAuth: true,
  async handler(req) {
    const segments = (req.query.address as string[]) || [];
    const id = segments[0];
    const parse = userSchema.safeParse(req.query);
    if (!parse.success || !id) throw new ApiError(400, 'Invalid parameters');
    const service = getApiAddressService();
    const address = await service.getAddress(id, parse.data.userId);
    return { address };
  }
});

/** Update address */
const updateHandler = createApiHandler({
  methods: ['PUT'],
  requiresAuth: true,
  async handler(req) {
    const segments = (req.query.address as string[]) || [];
    const id = segments[0];
    const parseQuery = userSchema.safeParse(req.query);
    const parseBody = updateSchema.safeParse(req.body);
    if (!parseQuery.success || !parseBody.success || !id) {
      throw new ApiError(400, 'Invalid parameters');
    }
    const service = getApiAddressService();
    const updated = await service.updateAddress(id, parseBody.data, parseQuery.data.userId);
    return { address: updated };
  }
});

/** Delete address */
const deleteHandler = createApiHandler({
  methods: ['DELETE'],
  requiresAuth: true,
  async handler(req) {
    const segments = (req.query.address as string[]) || [];
    const id = segments[0];
    const parse = userSchema.safeParse(req.query);
    if (!parse.success || !id) throw new ApiError(400, 'Invalid parameters');
    const service = getApiAddressService();
    await service.deleteAddress(id, parse.data.userId);
    return { success: true };
  }
});

export default function handler(req: any, res: any) {
  const segments = (req.query.address as string[]) || [];
  if (segments.length === 0) {
    if (req.method === 'GET') return listHandler(req, res);
    if (req.method === 'POST') return createHandler(req, res);
  } else if (segments.length === 1) {
    if (req.method === 'GET') return getHandler(req, res);
    if (req.method === 'PUT') return updateHandler(req, res);
    if (req.method === 'DELETE') return deleteHandler(req, res);
  }
  res.status(405).json({ error: 'Method Not Allowed' });
}

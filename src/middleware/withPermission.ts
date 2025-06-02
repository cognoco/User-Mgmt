import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission } from '@/lib/auth/hasPermission';

export interface WithPermissionOptions {
  allowSelf?: boolean;
}

export const withPermission = (
  requiredPermission: string,
  options?: WithPermissionOptions
) => {
  return (handler: NextApiHandler) =>
    async (req: NextApiRequest, res: NextApiResponse) => {
      const user = await getCurrentUser();
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (options?.allowSelf && req.query.id === user.id) {
        return handler(req, res);
      }

      const hasAccess = await hasPermission(user.id, requiredPermission as any);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      return handler(req, res);
    };
};
